// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unused-vars */

import type { Backend, Curve } from '@webb-tools/wasm-utils';

import { LoggerService } from '@webb-tools/app-util';
import { Note, NoteGenInput, ProvingManager, ProvingManagerSetupInput } from '@webb-tools/sdk-core';

import { decodeAddress } from '@polkadot/keyring';
import { hexToU8a, u8aToHex } from '@polkadot/util';

import { DepositPayload as IDepositPayload, VAnchorDeposit, VAnchorSize } from '../abstracts';
const logger = LoggerService.get('PolkadotVBridgeDeposit');

import type { WebbPolkadot } from './webb-provider';

import { naclEncrypt, randomAsU8a } from '@polkadot/util-crypto';

import { computeChainIdType, InternalChainId } from '../chains';
import { WebbError, WebbErrorCodes } from '../webb-error';
// TODO: export this from webb.js

async function create_utxo(
  curve: Curve,
  backend: Backend,
  input_size: number,
  anchor_size: number,
  amount: string,
  chain_id: string,
  index?: string,
  private_key?: Uint8Array,
  blinding?: Uint8Array
) {
  const wasm = await import('@webb-tools/wasm-utils');
  return new wasm.JsUtxo(curve, backend, input_size, anchor_size, amount, chain_id, index, private_key, blinding);
}

// The Deposit Payload is the note and [treeId]
type DepositPayload = IDepositPayload<Note, [number]>;
/**
 * Webb Anchor API implementation for Polkadot
 **/

async function fetchSubstrateAnchorProvingKey() {
  return new Uint8Array([]);
}

export class PolkadotVAnchorDeposit extends VAnchorDeposit<WebbPolkadot, DepositPayload> {
  async generateBridgeNote(
    vanchorId: string | number,
    destination: number,
    amount: number,
    wrappableAssetAddress?: string
  ): Promise<DepositPayload> {
    // Get the currency bridge currency
    const currency = this.bridgeApi.currency;

    // No currency is selected on the API
    if (!currency) {
      logger.error('Not currency/active bridge available');
      throw new Error('api not ready');
    }
    const tokenSymbol = currency.view.symbol;
    const destChainId = destination;
    // TODO: add mappers similar to evm chain id
    // const chainId = this.inner.api.registry.chainSS58!;
    const chainId = await this.inner.api.consts.linkableTreeBn254.chainIdentifier;
    const chainType = await this.inner.api.consts.linkableTreeBn254.chainType;
    const sourceChainId = computeChainIdType(Number(chainType.toHex()), Number(chainId));
    const anchorPath = String(vanchorId).replace('Bridge=', '').split('@');
    const anchorIndex = anchorPath[2];
    const anchors = await this.bridgeApi.getVariableAnchors();
    const anchor = anchors[Number(anchorIndex)];

    const treeId = anchor.neighbours[InternalChainId.ProtocolSubstrateStandalone] as number;

    const noteInput: NoteGenInput = {
      amount: String(amount),
      backend: 'Arkworks',
      curve: 'Bn254',
      denomination: '18',
      exponentiation: '5',
      hashFunction: 'Poseidon',
      protocol: 'vanchor',
      sourceChain: sourceChainId.toString(),
      sourceIdentifyingData: anchorIndex.toString(),
      targetChain: destChainId.toString(),
      targetIdentifyingData: treeId.toString(),
      tokenSymbol: tokenSymbol,
      width: '5',
      index: 0,
    };
    const note = await Note.generateNote(noteInput);
    return {
      note,
      params: [treeId],
    };
  }
  private async getleafIndex(leaf: Uint8Array, indexBeforeInsertion: number, treeId: number): Promise<number> {
    const api = this.inner.api;
    /**
     * Ex tree has 500 leaves
     * Before insertion index is 499
     * Given that many insertions happened while processing a tx
     * The tree now has 510 leaves
     * Fetch a slice of the leaves starting from the index before insertion [index499,...index509]
     * The leaf index will be index499 +  the index of the slice
     * */
    const leafCount = await api.derive.merkleTreeBn254.getLeafCountForTree(Number(treeId));
    const leaves = await api.derive.merkleTreeBn254.getLeavesForTree(
      Number(treeId),
      indexBeforeInsertion,
      leafCount - 1
    );
    const leafHex = u8aToHex(leaf);
    const shiftedIndex = leaves.findIndex((leaf) => u8aToHex(leaf) === leafHex);

    if (shiftedIndex === -1) {
      throw new Error(`Leaf isn't in the tree`);
    }
    return indexBeforeInsertion + shiftedIndex;
  }
  async deposit(depositPayload: DepositPayload, recipient: string): Promise<void> {
    // Getting the  active account
    const account = await this.inner.accounts.activeOrDefault;
    const secret = randomAsU8a();

    if (!account) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }

    const accountId = account.address;
    const relayerAccountId = account.address;
    const recipientAccountDecoded = decodeAddress(accountId);
    const relayerAccountDecoded = decodeAddress(relayerAccountId);

    const { note } = depositPayload.note;
    const treeId = depositPayload.params[0];
    const targetChainId = note.targetChainId;

    // output
    const output1 = note.getUtxo();
    const output2 = await create_utxo('Bn254', 'Arkworks', 2, 2, '0', targetChainId, undefined);
    let publicAmount = note.amount;
    const inputNotes = note.defaultUtxoNote();

    const leavesMap: any = {};
    leavesMap[targetChainId] = [];
    const tree = await this.inner.api.query.merkleTreeBn254.trees(treeId);
    const root = tree.unwrap().root.toHex();
    const rootsSet = [hexToU8a(root), hexToU8a(root)];
    const provingKey = await fetchSubstrateAnchorProvingKey();

    const { encrypted: comEnc1 } = naclEncrypt(output1.commitment, secret);
    const { encrypted: comEnc2 } = naclEncrypt(output2.commitment, secret);

    const extData = {
      relayer: accountId,
      recipient: relayerAccountId,
      fee: 0,
      extAmount: Number(publicAmount),
      encryptedOutput1: u8aToHex(comEnc1),
      encryptedOutput2: u8aToHex(comEnc2),
    };
    const vanchorDepositSetup: ProvingManagerSetupInput<'vanchor'> = {
      encryptedCommitments: [comEnc1, comEnc2],
      extAmount: publicAmount,
      fee: '0',
      leavesMap,
      provingKey,
      recipient: recipientAccountDecoded,
      relayer: relayerAccountDecoded,
      roots: rootsSet,
      chainId: note.targetChainId,
      indices: [0, 0],
      inputNotes: [inputNotes.serialize()],
      publicAmount,
      output: [output1, output2],
    };

    const worker = this.inner.wasmFactory('wasm-utils');
    const pm = new ProvingManager(worker);
    const data = await pm.prove('vanchor', vanchorDepositSetup);
    const vanchorProofData = {
      proof: `0x${data.proof}`,
      publicAmount: data.publicAmount,
      roots: rootsSet,
      inputNullifiers: data.inputUtxos.map((input) => `0x${input.nullifier}`),
      outputCommitments: data.outputNotes.map((note) => u8aToHex(note.getLeafCommitment())),
      extDataHash: data.extDataHash,
    };

    // @ts-ignore
    const leafsCount = await this.inner.api.derive.merkleTreeBn254.getLeafCountForTree(Number(treeId));
    const indexBeforeInsertion = Math.max(leafsCount - 1, 0);
    const tx = this.inner.txBuilder.build(
      {
        method: 'transact',
        section: 'vAnchorBn254',
      },
      [treeId, vanchorProofData, extData]
    );
    const txHash = await tx.call(account.address);

    const insertedLeaf = note.getLeafCommitment();
    const leafIndex = await this.getleafIndex(insertedLeaf, indexBeforeInsertion, treeId);
    note.mutateIndex(String(leafIndex));
    console.log(txHash);
    // return Note.deserialize(note.serialize());
  }

  async getSizes(): Promise<VAnchorSize[]> {
    const fixedAnchors = await this.bridgeApi.getVariableAnchors();
    const currency = this.bridgeApi.currency;

    if (currency) {
      return fixedAnchors.map((anchor, anchorIndex) => ({
        amount: Number(anchor.amount),
        asset: currency.view.symbol,
        id: `Bridge=variable@${currency.view.name}@${anchorIndex}`,
        title: `${anchor.amount} ${currency.view.name}`,
      }));
    }

    return [];
  }
}
