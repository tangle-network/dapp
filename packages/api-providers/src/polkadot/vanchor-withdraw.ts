// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import '@webb-tools/types';
import '@webb-tools/api-derive';

import type { WebbPolkadot } from './webb-provider';

import {
  currencyToUnitI128,
  fetchSubstrateVAnchorProvingKey,
  TransactionState,
  WebbError,
  WebbErrorCodes,
} from '@webb-dapp/api-providers';
import { getLeafCount, getLeafIndex, getLeaves, rootOfLeaves } from '@webb-dapp/api-providers/polkadot/mt-utils';
import { ArkworksProvingManager, Note, ProvingManagerSetupInput, Utxo } from '@webb-tools/sdk-core';
import { VAnchorProof } from '@webb-tools/sdk-core/proving/types';
import { BigNumber } from 'ethers';

import { decodeAddress } from '@polkadot/keyring';
import { hexToU8a, u8aToHex } from '@polkadot/util';
import { naclEncrypt, randomAsU8a } from '@polkadot/util-crypto';

import { VAnchorWithdraw, VAnchorWithdrawResult } from '../abstracts/anchor/vanchor-withdraw';

export class PolkadotVAnchorWithdraw extends VAnchorWithdraw<WebbPolkadot> {
  /**
   * notes - Withdraw notes that the use had already deposited , the notes should have the right index
   * recipient - Recipient account
   * amountUnit - amount to withdraw should be less or equal to the deposited notes amount
   * */
  async withdraw(notes: string[], recipient: string, amount: string): Promise<VAnchorWithdrawResult> {
    // TODO :Generate random secrets which can be supplied later by the user
    const secret = randomAsU8a();
    // Get the current active account
    const account = await this.inner.accounts.activeOrDefault;

    if (!account) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }
    const accountId = account.address;
    const relayerAccountId = account.address;
    const recipientAccountDecoded = decodeAddress(accountId);
    const relayerAccountDecoded = decodeAddress(relayerAccountId);
    // Notes deserialization
    const inputNotes = await Promise.all(notes.map((note) => Note.deserialize(note)));
    // Calculated the input amount
    const inputAmounts: number = inputNotes.reduce((acc: number, { note }) => acc + Number(note.amount), 0);
    // TODO: Fix the function to recive the denomination
    // Calculate the remainder amount
    const remainder = inputAmounts - Number(amount);
    // Ensure that remainder is more than 0
    if (remainder < 0) {
      this.emit('stateChange', TransactionState.Failed);
      this.emit('stateChange', TransactionState.Ideal);
      throw WebbError.from(WebbErrorCodes.AmountToWithdrawExceedsTheDepositedAmount);
    }

    this.emit('stateChange', TransactionState.FetchingFixtures);
    const provingKey = await fetchSubstrateVAnchorProvingKey();

    // Get the target chainId,treeId from the note
    const targetChainId = inputNotes[0].note.targetChainId;
    const treeId = inputNotes[0].note.sourceIdentifyingData;
    const output1 = await Utxo.generateUtxo({
      amount: String(remainder),
      chainId: targetChainId,
      backend: 'Arkworks',
      curve: 'Bn254',
    });
    const output2 = await Utxo.generateUtxo({
      amount: String(0),
      chainId: targetChainId,
      backend: 'Arkworks',
      curve: 'Bn254',
    });
    let publicAmount = -amount;
    // Get the last leaf index to fetch the leaves
    const latestIndex = inputNotes.reduce((index, { note }) => {
      if (index < Number(note.index)) {
        return Number(note.index);
      }
      return index;
    }, 0);
    this.emit('stateChange', TransactionState.FetchingLeaves);
    const leaves = await getLeaves(this.inner.api, Number(treeId), 0, latestIndex);
    const leavesMap: any = {};
    /// Assume same chain withdraw-deposit
    leavesMap[targetChainId] = leaves;
    // Get the root from local merkle tree build
    const root = await rootOfLeaves(leaves);
    const neighborRoots: string[] = await (this.inner.api.rpc as any).lt
      .getNeighborRoots(treeId)
      .then((roots: any) => roots.toHuman());
    const rootsSet = [root, hexToU8a(neighborRoots[0])];
    const outputNote = await Note.deserialize(inputNotes[0].serialize());
    const outputCommitment = output1.commitment;
    const { encrypted: comEnc1 } = naclEncrypt(output1.commitment, secret);
    const { encrypted: comEnc2 } = naclEncrypt(output2.commitment, secret);
    this.emit('stateChange', TransactionState.GeneratingZk);

    const extData = {
      relayer: accountId,
      recipient: relayerAccountId,
      fee: 0,
      extAmount: BigNumber.from(publicAmount),
      encryptedOutput1: u8aToHex(comEnc1),
      encryptedOutput2: u8aToHex(comEnc2),
    };

    const worker = this.inner.wasmFactory('wasm-utils');
    const pm = new ArkworksProvingManager(worker);

    const vanchorWithdrawSetup: ProvingManagerSetupInput<'vanchor'> = {
      encryptedCommitments: [comEnc1, comEnc2],
      extAmount: String(publicAmount),
      fee: '0',
      leavesMap,
      provingKey,
      recipient: recipientAccountDecoded,
      relayer: relayerAccountDecoded,
      roots: rootsSet,
      chainId: inputNotes[0].note.targetChainId,
      indices: inputNotes.map(({ note }) => Number(note.index)),
      inputNotes: inputNotes,
      publicAmount: String(publicAmount),
      output: [output1, output2],
    };

    const data: VAnchorProof = await pm.prove('vanchor', vanchorWithdrawSetup);
    const vanchorProofData = {
      proof: `0x${data.proof}`,
      publicAmount: data.publicAmount,
      roots: rootsSet,
      inputNullifiers: data.inputUtxos.map((utxo) => {
        return `0x${utxo.nullifier}`;
      }),
      outputCommitments: data.outputNotes.map((note) => u8aToHex(note.getLeaf())),
      extDataHash: data.extDataHash,
    };
    this.emit('stateChange', TransactionState.SendingTransaction);
    // get the leaf index to get the right leaf index ofter insertion
    const leafsCount = await getLeafCount(this.inner.api, Number(treeId));
    const predictedIndex = leafsCount;

    const method = {
      method: 'transact',
      section: 'vAnchorBn254',
    };
    const tx = this.inner.txBuilder.build(method, [treeId, vanchorProofData, extData]);
    const txHash = await tx.call(account.address);
    const leafIndex = await this.getleafIndex(outputCommitment, predictedIndex, Number(treeId));
    // update the UTXO of the remainder note
    outputNote.note.update_vanchor_utxo(output1.inner);
    // update the leaf index of the remainder note
    outputNote.mutateIndex(String(leafIndex));
    this.emit('stateChange', TransactionState.Done);
    this.emit('stateChange', TransactionState.Ideal);
    return {
      outputNotes: [outputNote],
      txHash: txHash,
    };
  }

  private async getleafIndex(leaf: Uint8Array, indexBeforeInsertion: number, treeId: number): Promise<number> {
    const api = this.inner.api;
    return getLeafIndex(api, leaf, indexBeforeInsertion, treeId);
  }
}
