// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unused-vars */

import '@webb-tools/api-derive/cjs/index.js';

import type { WebbPolkadot } from './webb-provider';

import { getLeafCount, getLeafIndex } from '@webb-dapp/api-providers/polkadot/mt-utils';
import { getCachedFixtureURI, withLocalFixtures } from '@webb-dapp/api-providers/utils';
import { LoggerService } from '@webb-tools/app-util';
import { ArkworksProvingManager, Note, NoteGenInput, ProvingManagerSetupInput, Utxo } from '@webb-tools/sdk-core';
import { VAnchorProof } from '@webb-tools/sdk-core/proving/types';
import { BigNumber } from 'ethers';

import { decodeAddress } from '@polkadot/keyring';
import { hexToU8a, u8aToHex } from '@polkadot/util';
import { naclEncrypt, randomAsU8a } from '@polkadot/util-crypto';

import { DepositPayload as IDepositPayload, VAnchorDeposit, VAnchorDepositResults, WithdrawState } from '../abstracts';
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

export class PolkadotVAnchorDeposit extends VAnchorDeposit<WebbPolkadot, DepositPayload> {
  private async getleafIndex(leaf: Uint8Array, indexBeforeInsertion: number, treeId: number): Promise<number> {
    return getLeafIndex(this.inner.api, leaf, indexBeforeInsertion, treeId);
  }

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
      sourceIdentifyingData: treeId.toString(),
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

  async deposit(depositPayload: DepositPayload): Promise<VAnchorDepositResults> {
    try {
      // Getting the active account
      const account = await this.inner.accounts.activeOrDefault;
      const secret = randomAsU8a();
      this.emit('stateChange', WithdrawState.GeneratingZk);

      if (!account) {
        throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
      }

      const accountId = account.address;
      const relayerAccountId = account.address;
      const recipientAccountDecoded = decodeAddress(accountId);
      const relayerAccountDecoded = decodeAddress(relayerAccountId);

      // output note (Already generated)
      const depositNote = depositPayload.note;
      const { note } = depositNote;
      // VAnchor tree id
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
      const inputNote = await depositPayload.note.getDefaultUtxoNote();
      // While depositing use an empty leaves
      const leavesMap: any = {};
      leavesMap[targetChainId] = [];
      // fetch latest root / neighbor roots
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
      const data: VAnchorProof = await pm.prove('vanchor', vanchorDepositSetup);
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
      // Store the next leaf index before insertion
      const leafsCount = await getLeafCount(this.inner.api, treeId);
      const predictedIndex = leafsCount;
      const tx = this.inner.txBuilder.build(
        {
          method: 'transact',
          section: 'vAnchorBn254',
        },
        [treeId, vanchorProofData, extData]
      );

      const txHash = await tx.call(account.address);

      const insertedLeaf = depositNote.getLeaf();
      const leafIndex = await this.getleafIndex(insertedLeaf, predictedIndex, treeId);
      // Update the leaf index
      depositNote.mutateIndex(String(leafIndex));
      this.emit('stateChange', WithdrawState.Done);
      return {
        txHash,
        updatedNote: depositNote,
      };
    } catch (e) {
      this.emit('stateChange', WithdrawState.Failed);
      throw e;
    }
  }

  async getSizes() {
    return [];
  }
}
