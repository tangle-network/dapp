// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unused-vars */

import '@webb-tools/api-derive';

import type { WebbPolkadot } from '../webb-provider';

import {
  DepositPayload as IDepositPayload,
  NewNotesTxResult,
  TransactionState,
  VAnchorDeposit,
} from '@nepoche/abstract-api-provider';
import { WebbError, WebbErrorCodes } from '@nepoche/dapp-types/WebbError';
import { fetchSubstrateVAnchorProvingKey } from '@nepoche/fixtures-deployments';
import { LoggerService } from '@webb-tools/app-util';
import {
  ArkworksProvingManager,
  calculateTypedChainId,
  Note,
  NoteGenInput,
  ProvingManagerSetupInput,
  Utxo,
  VAnchorProof,
} from '@webb-tools/sdk-core';
import { BigNumber, ethers } from 'ethers';

import { decodeAddress } from '@polkadot/keyring';
import { hexToU8a, u8aToHex } from '@polkadot/util';
import { naclEncrypt, randomAsU8a } from '@polkadot/util-crypto';

import { getLeafCount, getLeafIndex } from '../mt-utils';

const logger = LoggerService.get('PolkadotVBridgeDeposit');

// The Deposit Payload is the note and [treeId,WrappableAssetId]
type DepositPayload = IDepositPayload<Note, [number, number | undefined]>;

/**
 * Webb Anchor API implementation for Polkadot
 **/

export class PolkadotVAnchorDeposit extends VAnchorDeposit<WebbPolkadot, DepositPayload> {
  private async getleafIndex(leaf: Uint8Array, indexBeforeInsertion: number, treeId: number): Promise<number> {
    return getLeafIndex(this.inner.api, leaf, indexBeforeInsertion, treeId);
  }

  async generateBridgeNote(
    _vanchorId: string | number, // always Zero as there will be only one vanchor
    destinationChainId: number,
    amount: number,
    wrappableAssetAddress?: string
  ): Promise<DepositPayload> {
    // Get the currency bridge currency
    const currency = this.inner.methods.bridgeApi.getCurrency();

    // No currency is selected on the API
    if (!currency) {
      logger.error('Not currency/active bridge available');
      throw new Error('api not ready');
    }
    const bnAmount = ethers.utils.parseUnits(amount.toString(), currency.getDecimals());
    const tokenSymbol = currency.view.symbol;
    const destChainId = destinationChainId;
    // Chain id of the active API
    const chainId = await this.inner.api.consts.linkableTreeBn254.chainIdentifier;
    const chainType = await this.inner.api.consts.linkableTreeBn254.chainType;
    const sourceChainId = calculateTypedChainId(Number(chainType.toHex()), Number(chainId));
    const anchors = await this.bridgeApi.getAnchors();
    const anchor = anchors[0];
    // Tree id for the target chain
    const treeId = anchor.neighbours[sourceChainId] as number;

    const noteInput: NoteGenInput = {
      amount: bnAmount.toString(),
      backend: 'Arkworks',
      curve: 'Bn254',
      denomination: currency.view.decimals.toString(),
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
      params: [treeId, Number(wrappableAssetAddress)],
    };
  }
  private async getAccount() {
    const account = await this.inner.accounts.activeOrDefault;

    if (!account) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }
    return account;
  }

  async deposit(depositPayload: DepositPayload): Promise<NewNotesTxResult> {
    const wrappableAssetRaw = Number(depositPayload.params[1]);
    const wrapAndDepositFlow = typeof depositPayload.params[1] !== 'undefined' && !Number.isNaN(wrappableAssetRaw);

    // Validate if the provider is ready for a new deposit
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
    const abortSignal = this.cancelToken.abortSignal;
    try {
      const secret = randomAsU8a();

      // Getting the active account
      const account = await this.getAccount();
      const accountId = account.address;
      const relayerAccountId = account.address;
      const recipientAccountDecoded = decodeAddress(accountId);
      const relayerAccountDecoded = decodeAddress(relayerAccountId);

      this.cancelToken.throwIfCancel();
      // Loading fixtures
      this.emit('stateChange', TransactionState.FetchingFixtures);
      const provingKey = await fetchSubstrateVAnchorProvingKey(2, abortSignal);

      // output note (Already generated)
      const depositNote = depositPayload.note;

      // Add the note to the noteManager before transaction is sent.
      // This helps to safeguard the user.
      if (this.inner.noteManager) {
        await this.inner.noteManager.addNote(depositPayload.note);
      }

      const { note } = depositNote;

      // VAnchor tree id
      const treeId = depositPayload.params[0];
      const targetChainId = note.targetChainId;
      // Output utxos
      const output1 = new Utxo(note.getUtxo());
      const output2 = await Utxo.generateUtxo({
        backend: 'Arkworks',
        curve: 'Bn254',
        chainId: targetChainId,
        amount: '0',
      });
      let publicAmount = note.amount;
      const inputNote = await depositPayload.note.getDefaultUtxoNote();

      this.cancelToken.throwIfCancel();
      this.emit('stateChange', TransactionState.FetchingLeaves);

      // While depositing use an empty leaves
      const leavesMap: any = {};
      leavesMap[targetChainId] = [];
      // fetch latest root / neighbor roots
      const tree = await this.inner.api.query.merkleTreeBn254.trees(treeId);
      const root = tree.unwrap().root.toHex();
      const neighborRoots: string[] = await (this.inner.api.rpc as any).lt
        .getNeighborRoots(treeId)
        .then((roots: any) => roots.toHuman());

      this.cancelToken.throwIfCancel();
      this.emit('stateChange', TransactionState.GeneratingZk);
      const rootsSet = [hexToU8a(root), hexToU8a(neighborRoots[0])];

      const { encrypted: comEnc1 } = naclEncrypt(output1.commitment, secret);
      const { encrypted: comEnc2 } = naclEncrypt(output2.commitment, secret);
      const asset = wrapAndDepositFlow ? wrappableAssetRaw : 0;
      const refund = 0;
      const extData = {
        relayer: accountId,
        recipient: relayerAccountId,
        fee: 0,
        refund: String(refund),
        token: String(asset),
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
        refund: String(refund),
        token: Uint8Array.from([asset]),
      };
      console.log('vanchorDepositSetup: ', vanchorDepositSetup);

      this.cancelToken.throwIfCancel();
      const worker = this.inner.wasmFactory('wasm-utils');
      const pm = new ArkworksProvingManager(worker);
      const data = await this.cancelToken.handleOrThrow<VAnchorProof>(
        () => {
          return pm.prove('vanchor', vanchorDepositSetup);
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

      console.log(vanchorProofData);

      this.emit('stateChange', TransactionState.SendingTransaction);
      // Store the next leaf index before insertion
      const leafsCount = await getLeafCount(this.inner.api, treeId);
      const predictedIndex = leafsCount;
      let tx;
      if (wrapAndDepositFlow) {
        const governedToken = this.inner.methods.bridgeApi.getBridge()?.currency!;
        const chainId = this.inner.typedChainId;
        const wrappableAssets = await this.inner.methods.bridgeApi.fetchWrappableAssets(chainId);
        const wrappableAssetId = this.inner.state
          .getReverseCurrencyMapWithChainId(chainId)
          .get(String(wrappableAssetRaw))!;

        const wrappableToken = wrappableAssets.find((asset) => asset.id === wrappableAssetId)!;
        const wrappedTokenId = governedToken.getAddress(chainId)!;
        const wrappableTokenId = wrappableToken.getAddress(chainId)!;
        const address = account.address;
        const amount = note.amount;
        tx = this.inner.txBuilder.build(
          [
            {
              method: 'wrap',
              section: 'tokenWrapper',
            },
            {
              method: 'transact',
              section: 'vAnchorBn254',
            },
          ],
          [
            [wrappableTokenId, wrappedTokenId, amount, address],
            [treeId, vanchorProofData, extData],
          ]
        );
      } else {
        tx = this.inner.txBuilder.build(
          {
            method: 'transact',
            section: 'vAnchorBn254',
          },
          [treeId, vanchorProofData, extData]
        );
      }

      this.cancelToken.throwIfCancel();
      const txHash = await tx.call(account.address);

      const insertedLeaf = depositNote.getLeaf();
      const leafIndex = await this.getleafIndex(insertedLeaf, predictedIndex, treeId);
      // Update the leaf index
      depositNote.mutateIndex(String(leafIndex));

      this.emit('stateChange', TransactionState.Done);
      return {
        txHash,
        outputNotes: [depositNote],
      };
    } catch (e) {
      if (e instanceof WebbError && e.code !== WebbErrorCodes.TransactionCancelled) {
        this.emit('stateChange', TransactionState.Failed);
        if (this.inner.noteManager) {
          this.inner.noteManager.removeNote(depositPayload.note);
        }
      }
      throw e;
    }
  }
}
