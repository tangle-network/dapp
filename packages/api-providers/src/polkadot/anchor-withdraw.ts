// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { ArkworksProvingManager, Note, parseTypedChainId, ProvingManagerSetupInput } from '@webb-tools/sdk-core';

import { decodeAddress } from '@polkadot/keyring';
import { u8aToHex } from '@polkadot/util';

import { AnchorWithdraw, TransactionState } from '../abstracts';
import { typedChainIdToInternalId } from '../chains';
import { WebbError, WebbErrorCodes } from '../webb-error';
import { fetchSubstrateAnchorProvingKey } from '../';
import { WebbPolkadot } from './webb-provider';

/**
 * @param id - Anchor tree id
 * @param proofBytes - Zero-knowledge Proof bytes
 * @param root - Tree root
 * @param nullifierHash - Nullifier hash
 * @param recipient - Recipient accountId Ss558 format
 * @param relayer - Relayer accountId Ss558 format
 * @param fee - Fee value, should be the same as used while generating the zkp
 * @param refund - Refund value, should be the same as used while generating the zkp
 * @param refreshCommitment - Refresh commitment should be the same as used while generating  the zkp
 **/
export type AnchorWithdrawProof = {
  id: string;
  proofBytes: string;
  root: string;
  nullifierHash: string;
  recipient: string;
  relayer: string;
  fee: number;
  refund: number;
  refreshCommitment: string;
};

export class PolkadotAnchorWithdraw extends AnchorWithdraw<WebbPolkadot> {
  async fetchRPCTreeLeaves(treeId: string | number): Promise<Uint8Array[]> {
    let done = false;
    let from = 0;
    let to = 511;
    const leaves: Uint8Array[] = [];

    while (done === false) {
      const treeLeaves: any[] = await (this.inner.api.rpc as any).mt.getLeaves(treeId, from, to);

      if (treeLeaves.length === 0) {
        done = true;
        break;
      }

      leaves.push(...treeLeaves.map((i) => i.toU8a()));
      from = to;
      to = to + 511;
    }

    return leaves;
  }

  async fetchRoot(treeId: number) {
    const storage = await this.inner.api.query.merkleTreeBn254.trees(treeId);
    return storage.unwrap().root;
  }

  async withdraw(note: string, recipient: string): Promise<string> {
    // TODO: implement cross chain
    // TODO: Integrate with Substrate relayer
    // TODO handle the cached roots
    try {
      // Getting the  active account
      const account = await this.inner.accounts.activeOrDefault;

      if (!account) {
        throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
      }

      const accountId = account.address;
      const relayerAccountId = account.address;

      this.emit('stateChange', TransactionState.GeneratingZk);
      const parseNote = await Note.deserialize(note);
      const depositNote = parseNote.note;
      const amount = parseNote.note.amount;
      // listing anchors
      const anchors = await this.inner.methods.anchorApi.getAnchors();
      // Get the anchor of the note amount
      const anchor = anchors.find((a) => a.amount === amount)!;

      const treeId =
        anchor.neighbours[typedChainIdToInternalId(parseTypedChainId(Number(parseNote.note.sourceChainId)))];

      if (!treeId) {
        throw new Error('Could not find the treeId');
      }

      // Fetching tree leaves
      const leaves = await this.fetchRPCTreeLeaves(treeId);
      const leaf = depositNote.getLeafCommitment();
      const leafHex = u8aToHex(leaf);
      // Find the index of the note's leaf commitment
      const leafIndex = leaves.findIndex((leaf) => u8aToHex(leaf) === leafHex);

      // Init a worker from the factory with `wasm-utils` key
      const worker = this.inner.wasmFactory('wasm-utils');
      const pm = new ArkworksProvingManager(worker);

      // Converting accounts into hex
      const recipientAccountHex = u8aToHex(decodeAddress(recipient));
      const relayerAccountHex = u8aToHex(decodeAddress(recipient));

      // Fetching the proving key
      const provingKey = await fetchSubstrateAnchorProvingKey();
      // Pass in an empty leaf for the refresh commitment
      const refreshCommitment = '0000000000000000000000000000000000000000000000000000000000000000';
      // Get the linked tree root
      const root = await this.fetchRoot(Number(treeId));

      const proofInput: ProvingManagerSetupInput<'anchor'> = {
        fee: 0,
        leafIndex,
        leaves,
        note,
        provingKey,
        recipient: recipientAccountHex.replace('0x', ''),
        refreshCommitment,
        refund: 0,
        relayer: relayerAccountHex.replace('0x', ''),
        // Enter
        roots: [root, root],
      };

      console.log('proofInput: ', proofInput);

      const zkProofMetadata = await pm.prove('anchor', proofInput);

      console.log('proofOutput: ', zkProofMetadata);

      const withdrawProof: AnchorWithdrawProof = {
        fee: 0,
        id: treeId.toString(),
        nullifierHash: `0x${zkProofMetadata.nullifierHash}`,
        proofBytes: `0x${zkProofMetadata.proof}` as any,
        recipient: accountId,
        refreshCommitment: `0x${refreshCommitment}`,
        refund: 0,
        relayer: relayerAccountId,
        root: `0x${zkProofMetadata.root}`,
      };
      const parms = [
        withdrawProof.id,
        withdrawProof.proofBytes,
        zkProofMetadata.roots.map((i: string) => `0x${i}`),
        withdrawProof.nullifierHash,
        withdrawProof.recipient,
        withdrawProof.relayer,
        withdrawProof.fee,
        withdrawProof.refund,
        withdrawProof.refreshCommitment,
      ];

      this.emit('stateChange', TransactionState.SendingTransaction);
      const tx = this.inner.txBuilder.build(
        {
          method: 'withdraw',
          section: 'anchorBn254',
        },
        parms
      );
      const hash = await tx.call(account.address);

      this.emit('stateChange', TransactionState.Done);

      return hash || '';
    } catch (e) {
      this.emit('stateChange', TransactionState.Failed);
      throw e;
    }
  }
}
