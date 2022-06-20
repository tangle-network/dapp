// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import '@webb-tools/types/cjs/index.js';
import '@webb-tools/api-derive/cjs/index.js';

import type { WebbPolkadot } from './webb-provider';

import {
  currencyToUnitI128,
  getCachedFixtureURI,
  WebbError,
  WebbErrorCodes,
  WithdrawState,
  withLocalFixtures,
} from '@webb-dapp/api-providers';
import { getLeafCount, getLeafIndex, getLeaves, rootOfLeaves } from '@webb-dapp/api-providers/polkadot/mt-utils';
import { LoggerService } from '@webb-tools/app-util';
import { ArkworksProvingManager, Note, ProvingManagerSetupInput, Utxo } from '@webb-tools/sdk-core';
import { BigNumber } from 'ethers';

import { decodeAddress } from '@polkadot/keyring';
import { hexToU8a, u8aToHex } from '@polkadot/util';
import { naclEncrypt, randomAsU8a } from '@polkadot/util-crypto';

import { VAnchorWithdraw, VAnchorWithdrawResult } from '../abstracts/anchor/vanchor-withdraw';

const logger = LoggerService.get('SubstrateVAnchorWithdraw');
async function fetchSubstrateVAnchorProvingKey() {
  const IPFSUrl = 'https://ipfs.io/ipfs/QmZiNuAKp2QGp281bqasNqvqccPCGp4yoxWbK8feecefML';
  const cachedURI = getCachedFixtureURI('proving_key_uncompressed_sub_vanchor_2_2_2.bin');
  const ipfsKeyRequest = await fetch(withLocalFixtures() ? cachedURI : IPFSUrl);
  const circuitKeyArrayBuffer = await ipfsKeyRequest.arrayBuffer();

  logger.info('Done Fetching key');
  const circuitKey = new Uint8Array(circuitKeyArrayBuffer);

  return circuitKey;
}

export class PolkadotVAnchorWithdraw extends VAnchorWithdraw<WebbPolkadot> {
  async withdraw(notes: string[], recipient: string, amountUnit: string): Promise<VAnchorWithdrawResult> {
    const secret = randomAsU8a();
    const account = await this.inner.accounts.activeOrDefault;

    this.emit('stateChange', WithdrawState.GeneratingZk);

    if (!account) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }

    const accountId = account.address;
    const relayerAccountId = account.address;
    const recipientAccountDecoded = decodeAddress(accountId);
    const relayerAccountDecoded = decodeAddress(relayerAccountId);

    const inputNotes = await Promise.all(notes.map((note) => Note.deserialize(note)));
    const inputAmounts: number = inputNotes.reduce((acc: number, { note }) => acc + Number(note.amount), 0);
    const amount = currencyToUnitI128(Number(amountUnit)).toString();

    const reminder = inputAmounts - Number(amount);

    if (reminder < 0) {
      throw new Error(`Input ${inputAmounts} is less than the withdrawn amount ${amount}`);
    }

    const targetChainId = inputNotes[0].note.targetChainId;
    const treeId = inputNotes[0].note.sourceIdentifyingData;
    const output1 = await Utxo.generateUtxo({
      amount: String(reminder),
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

    const latestIndex = inputNotes.reduce((index, { note }) => {
      if (index < Number(note.index)) {
        return Number(note.index);
      }
      return index;
    }, 0);
    console.log(`last leaf index ${latestIndex}`);
    const leaves = await getLeaves(this.inner.api, Number(treeId), 0, latestIndex);
    const leavesMap: any = {};
    /// Assume same chain withdraw-deposit
    leavesMap[targetChainId] = leaves;
    const root = await rootOfLeaves(leaves);
    const neighborRoots: string[] = await (this.inner.api.rpc as any).lt
      .getNeighborRoots(treeId)
      .then((roots: any) => roots.toHuman());
    const rootsSet = [root, hexToU8a(neighborRoots[0])];
    const outputNote = await Note.deserialize(inputNotes[0].serialize());
    const outputCommitment = output1.commitment;
    const { encrypted: comEnc1 } = naclEncrypt(output1.commitment, secret);
    const { encrypted: comEnc2 } = naclEncrypt(output2.commitment, secret);

    const provingKey = await fetchSubstrateVAnchorProvingKey();
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

    const vnachorWithdrawSetup: ProvingManagerSetupInput<'vanchor'> = {
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

    const data = await pm.prove('vanchor', vnachorWithdrawSetup);
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
    this.emit('stateChange', WithdrawState.SendingTransaction);
    const leafsCount = await getLeafCount(this.inner.api, Number(treeId));
    const predictedIndex = leafsCount;

    const method = {
      method: 'transact',
      section: 'vAnchorBn254',
    };
    const tx = this.inner.txBuilder.build(method, [treeId, vanchorProofData, extData]);
    console.log([treeId, vanchorProofData, extData]);

    const txHash = await tx.call(account.address);
    const leafIndex = await this.getleafIndex(outputCommitment, predictedIndex, Number(treeId));
    outputNote.note.update_vanchor_utxo(output1.inner);
    await outputNote.mutateIndex(String(leafIndex));
    console.log({
      leafsCount,
      indexBeforeInsertion: predictedIndex,
      leafIndex,
    });
    return {
      method,
      outputNotes: [outputNote],
      txHash: txHash,
    };
  }

  private async getleafIndex(leaf: Uint8Array, indexBeforeInsertion: number, treeId: number): Promise<number> {
    const api = this.inner.api;
    return getLeafIndex(api, leaf, indexBeforeInsertion, treeId);
  }
}
