// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import '@webb-tools/protocol-substrate-types';
import '@webb-tools/api-derive';

import type { WebbPolkadot } from '../webb-provider';

import {
  NewNotesTxResult,
  RelayedChainInput,
  RelayedWithdrawResult,
  VAnchorWithdraw,
} from '@nepoche/abstract-api-provider';
import { typedChainIdToSubstrateRelayerName } from '@nepoche/dapp-config/relayer-config';
import { TransactionState, WebbError, WebbErrorCodes } from '@nepoche/dapp-types';
import { fetchSubstrateVAnchorProvingKey } from '@nepoche/fixtures-deployments';
import { ArkworksProvingManager, Note, parseTypedChainId, ProvingManagerSetupInput, Utxo } from '@webb-tools/sdk-core';
import { VAnchorProof } from '@webb-tools/sdk-core/proving/types';
import { BigNumber } from 'ethers';

import { decodeAddress } from '@polkadot/keyring';
import { hexToU8a, u8aToHex } from '@polkadot/util';
import { naclEncrypt, randomAsU8a } from '@polkadot/util-crypto';

import { getLeafCount, getLeafIndex, getLeaves, rootOfLeaves } from '../mt-utils';

export class PolkadotVAnchorWithdraw extends VAnchorWithdraw<WebbPolkadot> {
  /**
   * notes - Withdraw notes that the use had already deposited , the notes should have the right index
   * recipient - Recipient account
   * amount - amount to withdraw in bnUnits (i.e. WEI instead of ETH)
   * */
  async withdraw(notes: string[], recipient: string, amount: string): Promise<NewNotesTxResult> {
    switch (this.state) {
      case TransactionState.Cancelling:
      case TransactionState.Failed:
      case TransactionState.Done:
        this.cancelToken.reset();
        this.state = TransactionState.Ideal;
        break;
      case TransactionState.Ideal:
        break;
      default:
        throw WebbError.from(WebbErrorCodes.TransactionInProgress);
    }
    // TODO :Generate random secrets which can be supplied later by the user
    const secret = randomAsU8a();
    const abortSignal = this.cancelToken.abortSignal;
    // Get the current active account
    const account = await this.inner.accounts.activeOrDefault;
    let txHash = '';
    let predictedIndex = 0;
    if (!account) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }
    const activeRelayer = this.inner.relayerManager.activeRelayer;
    const activeRelayerAccount = activeRelayer?.beneficiary;
    if (activeRelayer && activeRelayerAccount === undefined) {
      // Fix the error code/message
      throw WebbError.from(WebbErrorCodes.RelayerUnsupportedMixer);
    }
    const accountId = account.address;
    const relayerAccountId = activeRelayer ? activeRelayerAccount! : account.address;
    const recipientAccountDecoded = decodeAddress(recipient);
    const relayerAccountDecoded = decodeAddress(relayerAccountId);
    // Notes deserialization
    const inputNotes = await Promise.all(notes.map((note) => Note.deserialize(note)));
    if (!inputNotes.length) {
      throw WebbError.from(WebbErrorCodes.NoteParsingFailure);
    }
    // Calculated the input amount
    const inputAmount: BigNumber = inputNotes.reduce(
      (acc: BigNumber, { note }) => acc.add(BigNumber.from(note.amount)),
      BigNumber.from(0)
    );
    // TODO: Fix the function to recive the denomination
    // Calculate the remainder amount
    const remainder = inputAmount.sub(BigNumber.from(amount));
    // Ensure that remainder is more than 0
    if (remainder.lt(0)) {
      this.emit('stateChange', TransactionState.Failed);
      this.emit('stateChange', TransactionState.Ideal);
      throw WebbError.from(WebbErrorCodes.AmountToWithdrawExceedsTheDepositedAmount);
    }
    this.cancelToken.throwIfCancel();

    this.emit('stateChange', TransactionState.FetchingFixtures);
    const provingKey = await fetchSubstrateVAnchorProvingKey(2, abortSignal);

    // Get the target chainId,treeId from the note
    const targetChainId = inputNotes[0].note.targetChainId;
    const treeId = inputNotes[0].note.sourceIdentifyingData;
    const output1 = await Utxo.generateUtxo({
      amount: remainder.toString(),
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

    // When a user submits a note, it may be that the index is not correct.
    // We should validate the index and update before proof generation.
    const latestPredictedIndex = inputNotes.reduce((index, note) => {
      if (index < Number(note.note.index)) {
        return Number(note.note.index);
      }
      return index;
    }, 0);

    const latestNote = inputNotes.find((note) => note.note.index === latestPredictedIndex.toString());
    if (!latestNote) {
      throw WebbError.from(WebbErrorCodes.NoteParsingFailure);
    }

    this.cancelToken.throwIfCancel();

    this.emit('stateChange', TransactionState.FetchingLeaves);

    const inputLeafIndex = await this.getleafIndex(
      latestNote.note.getLeafCommitment(),
      latestPredictedIndex,
      Number(treeId)
    );

    const leaves = await getLeaves(this.inner.api, Number(treeId), 0, inputLeafIndex);
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
      relayer: relayerAccountId,
      recipient: accountId,
      fee: 0,
      refund: 0,
      token: '0',
      // Convert to string for value safety Ref: https://docs.ethers.io/v5/troubleshooting/errors/#help-NUMERIC_FAULT-overflow
      extAmount: BigNumber.from(String(publicAmount)),
      encryptedOutput1: u8aToHex(comEnc1),
      encryptedOutput2: u8aToHex(comEnc2),
    };
    this.cancelToken.throwIfCancel();

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
      refund: '0',
      token: Uint8Array.from([0]),
    };
    const destChainIdType = parseTypedChainId(Number(inputNotes[0].note.targetChainId));

    const data = await this.cancelToken.handleOrThrow<VAnchorProof>(
      () => {
        return pm.prove('vanchor', vanchorWithdrawSetup);
      },
      () => {
        worker?.terminate();
        return WebbError.from(WebbErrorCodes.TransactionCancelled);
      }
    );

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

    // before the transaction takes place, save the output (change) note (in case user leaves page or
    // perhaps relayer misbehaves and doesn't respond but executes transaction)
    if (Number(data.outputNotes[0].note.amount) != 0) {
      await this.inner.noteManager?.addNote(data.outputNotes[0]);
    }

    if (activeRelayer) {
      const relayedVAnchorWithdraw = await activeRelayer.initWithdraw('vAnchor');
      const chainName = typedChainIdToSubstrateRelayerName(Number(inputNotes[0].note.targetChainId));
      const substrateId = destChainIdType.chainId;
      const chainInfo: RelayedChainInput = {
        baseOn: 'substrate',
        contractAddress: '',
        endpoint: '',
        name: chainName,
      };
      const relayedDepositTxPayload = relayedVAnchorWithdraw.generateWithdrawRequest<typeof chainInfo, 'vAnchor'>(
        chainInfo,
        {
          chainId: substrateId,
          id: Number(treeId),
          extData: {
            recipient: extData.recipient,
            relayer: extData.relayer,
            extAmount: extData.extAmount.toNumber(),
            fee: extData.fee,
            encryptedOutput1: Array.from(hexToU8a(extData.encryptedOutput1)),
            encryptedOutput2: Array.from(hexToU8a(extData.encryptedOutput2)),
            refund: '0',
            token: '0',
          },
          proofData: {
            proof: Array.from(hexToU8a(vanchorProofData.proof)),
            extDataHash: Array.from(vanchorProofData.extDataHash),
            publicAmount: Array.from(vanchorProofData.publicAmount),
            roots: vanchorProofData.roots.map((root) => Array.from(root)),
            outputCommitments: vanchorProofData.outputCommitments.map((com) => Array.from(hexToU8a(com))),
            inputNullifiers: vanchorProofData.inputNullifiers.map((com) => Array.from(hexToU8a(com))),
          },
        }
      );

      relayedVAnchorWithdraw.watcher.subscribe(([results, message]) => {
        switch (results) {
          case RelayedWithdrawResult.PreFlight:
            this.emit('stateChange', TransactionState.SendingTransaction);
            break;
          case RelayedWithdrawResult.OnFlight:
            break;
          case RelayedWithdrawResult.Continue:
            break;
          case RelayedWithdrawResult.CleanExit:
            this.emit('stateChange', TransactionState.Done);
            this.emit('stateChange', TransactionState.Ideal);

            this.inner.notificationHandler({
              description: `TX hash:`,
              key: 'vanchor-withdraw-sub',
              level: 'success',
              message: 'vanchor254:withdraw',
              name: 'Transaction',
            });

            break;
          case RelayedWithdrawResult.Errored:
            this.emit('stateChange', TransactionState.Failed);
            this.emit('stateChange', TransactionState.Ideal);

            this.inner.notificationHandler({
              description: message || 'Withdraw failed',
              key: 'vanchor-withdraw-sub',
              level: 'success',
              message: 'vanchor254:withdraw',
              name: 'Transaction',
            });
            break;
        }
      });

      this.inner.notificationHandler({
        description: 'Sending TX to relayer',
        key: 'vanchor-withdraw-sub',
        level: 'loading',
        message: 'vanchor254:withdraw',

        name: 'Transaction',
      });
      predictedIndex = await getLeafCount(this.inner.api, Number(treeId));
      /// may cancel before the relayer submits the transaction
      this.cancelToken.throwIfCancel();

      relayedVAnchorWithdraw.send(relayedDepositTxPayload);
      const results = await relayedVAnchorWithdraw.await();
      if (results) {
        const [, message] = results;
        txHash = message!;
      }
    } else {
      this.emit('stateChange', TransactionState.SendingTransaction);
      const leafsCount = await getLeafCount(this.inner.api, Number(treeId));
      predictedIndex = leafsCount;

      const method = {
        method: 'transact',
        section: 'vAnchorBn254',
      };
      const tx = this.inner.txBuilder.build(method, [treeId, vanchorProofData, extData]);
      // May cancel before transaction is submitted
      this.cancelToken.throwIfCancel();
      txHash = await tx.call(account.address);
    }

    // remove the previous "Potential Change Note" (safeguard for user)
    await this.inner.noteManager?.removeNote(data.outputNotes[0]);

    // get the leaf index to get the right leaf index after insertion
    const leafIndex = await this.getleafIndex(outputCommitment, predictedIndex, Number(treeId));
    outputNote.note.mutateIndex(leafIndex.toString());

    // update the UTXO of the remainder note
    outputNote.note.update_vanchor_utxo(output1.inner);

    // Update the index of the change note and remove the input notes
    if (this.inner.noteManager) {
      if (Number(outputNote.note.amount) != 0) {
        await this.inner.noteManager.addNote(outputNote);
      }
      await Promise.all(
        inputNotes.map(async (note) => {
          await this.inner.noteManager?.removeNote(note);
        })
      );
    }

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
