// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unused-vars */

import '@webb-tools/api-derive/index.js';

import type { WebbPolkadot } from './webb-provider';

import { createUtxoBn254CT2, getCachedFixtureURI, withLocalFixtures } from '@webb-dapp/api-providers/utils';
import { LoggerService } from '@webb-tools/app-util';
import {
  ArkworksProvingManager,
  Note,
  NoteGenInput,
  ProofInterface,
  ProvingManagerSetupInput,
  Utxo,
} from '@webb-tools/sdk-core';
import { BigNumber } from 'ethers';

import { decodeAddress } from '@polkadot/keyring';
import { hexToU8a, u8aToHex } from '@polkadot/util';
import { naclEncrypt, randomAsU8a } from '@polkadot/util-crypto';

import { DepositPayload as IDepositPayload, VAnchorDeposit } from '../abstracts';
import { computeChainIdType, InternalChainId } from '../chains';
import { WebbError, WebbErrorCodes } from '../webb-error';

const logger = LoggerService.get('PolkadotVBridgeDeposit');

export function currencyToUnitI128(currencyAmount: number) {
  let bn = BigNumber.from(currencyAmount);
  return bn.mul(1_000_000_000_000);
}

// TODO: export this from webb.js

// The Deposit Payload is the note and [treeId]
type DepositPayload = IDepositPayload<Note, [number]>;

/**
 * Webb Anchor API implementation for Polkadot
 **/

async function fetchSubstrateVAnchorProvingKey() {
  const IPFSUrl = 'https://ipfs.io/ipfs/QmZiNuAKp2QGp281bqasNqvqccPCGp4yoxWbK8feecefML';
  const cachedURI = getCachedFixtureURI('proving_key_uncompressed_sub_vanchor_2_2_2.bin');
  const ipfsKeyRequest = await fetch(withLocalFixtures() ? cachedURI : IPFSUrl);
  const circuitKeyArrayBuffer = await ipfsKeyRequest.arrayBuffer();

  logger.info('Done Fetching key');
  const circuitKey = new Uint8Array(circuitKeyArrayBuffer);

  return circuitKey;
}

async function generateVAnchorNote(amount: number, chainId: number, outputChainId: number, index?: number) {
  const note = await Note.generateNote({
    amount: String(amount),
    backend: 'Arkworks',
    curve: 'Bn254',
    denomination: String(18),
    exponentiation: String(5),
    hashFunction: 'Poseidon',
    index,
    protocol: 'vanchor',
    sourceChain: String(chainId),
    sourceIdentifyingData: '1',
    targetChain: String(outputChainId),
    targetIdentifyingData: '1',
    tokenSymbol: 'WEBB',
    version: 'v2',
    width: String(5),
  });

  return note;
}

async function fetchSubstrateVAAnchorVerifyingKey() {
  const cachedURI = getCachedFixtureURI('vanchor_sub_vk_un_2_2_2.bin');
  const ipfsKeyRequest = await fetch(cachedURI);
  const circuitKeyArrayBuffer = await ipfsKeyRequest.arrayBuffer();

  logger.info('Done Fetching key');
  const circuitKey = new Uint8Array(circuitKeyArrayBuffer);

  return circuitKey;
}

async function verfyProof(data: ProofInterface<'vanchor'>, vk: Uint8Array) {
  const wasm = await import('@webb-tools/wasm-utils');
  return wasm.verify_js_proof(data.proof, data.publicInputs, u8aToHex(vk).replace('0x', ''), 'Bn254');
}

export class PolkadotVAnchorDeposit extends VAnchorDeposit<WebbPolkadot, DepositPayload> {
  async generateBridgeNote(
    _vanchorId: string | number, // always Zero as there will be only one vanchor
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
    // Chain id of the active API
    const chainId = await this.inner.api.consts.linkableTreeBn254.chainIdentifier;
    const chainType = await this.inner.api.consts.linkableTreeBn254.chainType;
    const sourceChainId = computeChainIdType(Number(chainType.toHex()), Number(chainId));
    const anchors = await this.bridgeApi.getVariableAnchors();
    const anchor = anchors[0];
    // Tree id for the target chain
    const treeId = anchor.neighbours[InternalChainId.ProtocolSubstrateStandalone] as number;

    const noteInput: NoteGenInput = {
      amount: currencyToUnitI128(amount).toString(),
      backend: 'Arkworks',
      curve: 'Bn254',
      denomination: '18',
      exponentiation: '5',
      hashFunction: 'Poseidon',
      protocol: 'vanchor',
      sourceChain: sourceChainId.toString(),
      sourceIdentifyingData: String(0),
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

    // output note
    const { note } = depositPayload.note;
    const treeId = depositPayload.params[0];
    const targetChainId = note.targetChainId;

    const output1 = new Utxo(note.getUtxo());

    const output2 = await Utxo.generateUtxo({
      backend: 'Arkworks',
      curve: 'Bn254',
      chainId: targetChainId,
      amount: '0',
    });
    let publicAmount = note.amount;
    const inputNote = depositPayload.note.getDefaultUtxoNote();

    const leavesMap: any = {};
    leavesMap[targetChainId] = [];
    const tree = await this.inner.api.query.merkleTreeBn254.trees(treeId);
    const root = tree.unwrap().root.toHex();
    const neighborRoots: string[] = await (this.inner.api.rpc as any).lt
      .getNeighborRoots(treeId)
      .then((roots: any) => roots.toHuman());

    const rootsSet = [hexToU8a(root), hexToU8a(neighborRoots[0])];
    const provingKey = await fetchSubstrateVAnchorProvingKey();

    const { encrypted: comEnc1 } = naclEncrypt(output1.commitment, secret);
    const { encrypted: comEnc2 } = naclEncrypt(output2.commitment, secret);

    const extData = {
      relayer: accountId,
      recipient: relayerAccountId,
      fee: 0,
      extAmount: BigNumber.from(publicAmount),
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
      indices: [0],
      inputNotes: [inputNote],
      publicAmount,
      output: [output1, output2],
    };
    const worker = this.inner.wasmFactory('wasm-utils');
    const pm = new ArkworksProvingManager(worker);
    const data = await pm.prove('vanchor', vanchorDepositSetup);
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
    console.log(txHash, leafIndex);
    // return Note.deserialize(note.serialize());
  }

  async getSizes() {
    return [];
  }
}
