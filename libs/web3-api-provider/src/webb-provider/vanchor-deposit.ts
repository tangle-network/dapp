// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  DepositPayload as IDepositPayload,
  FixturesStatus,
  NewNotesTxResult,
  Transaction,
  TransactionState,
  VAnchorDeposit,
} from '@webb-tools/abstract-api-provider';
import { bridgeStorageFactory } from '@webb-tools/browser-utils/storage';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types';
import {
  fetchVAnchorKeyFromAws,
  fetchVAnchorWasmFromAws,
} from '@webb-tools/fixtures-deployments';
import { ERC20__factory as ERC20Factory } from '@webb-tools/contracts';
import {
  calculateTypedChainId,
  ChainType,
  CircomUtxo,
  Keypair,
  Note,
  NoteGenInput,
  toFixedHex,
  Utxo,
} from '@webb-tools/sdk-core';
import { ethers } from 'ethers';

import { hexToU8a } from '@polkadot/util';

import { Web3Provider } from '../ext-provider';
import { WebbWeb3Provider } from '../webb-provider';

type DepositPayload = IDepositPayload<Note, [Utxo, number | string, string?]>;

export class Web3VAnchorDeposit extends VAnchorDeposit<
  WebbWeb3Provider,
  DepositPayload
> {
  async generateBridgeNote(
    anchorId: string | number,
    destination: number,
    amount: number,
    wrappableAssetAddress?: string
  ): Promise<DepositPayload> {
    console.log('generateBridgeNote: ', anchorId, destination, amount);
    const bridge = this.inner.methods.bridgeApi.getBridge();
    const currency = bridge?.currency;

    if (!bridge || !currency) {
      throw new Error('api not ready');
    }
    // Convert the amount to bn units (i.e. WEI instead of ETH)
    const bnAmount = ethers.utils
      .parseUnits(amount.toString(), currency.getDecimals())
      .toString();
    const tokenSymbol = currency.view.symbol;
    const sourceEvmId = await this.inner.getChainId();
    const sourceChainId = calculateTypedChainId(ChainType.EVM, sourceEvmId);

    const keypair = this.inner.noteManager
      ? this.inner.noteManager.getKeypair()
      : new Keypair();

    console.log('got the keypair');

    // Convert the amount to units of wei
    const depositOutputUtxo = await CircomUtxo.generateUtxo({
      curve: 'Bn254',
      backend: 'Circom',
      amount: bnAmount,
      originChainId: sourceChainId.toString(),
      chainId: destination.toString(),
      keypair,
    });

    console.log('generated the utxo: ', depositOutputUtxo.serialize());

    const srcAddress = bridge.targets[sourceChainId];
    const destAddress = bridge.targets[destination];

    const noteInput: NoteGenInput = {
      amount: bnAmount.toString(),
      backend: 'Circom',
      curve: 'Bn254',
      denomination: '18',
      exponentiation: '5',
      hashFunction: 'Poseidon',
      protocol: 'vanchor',
      secrets: [
        toFixedHex(destination, 8).substring(2),
        toFixedHex(depositOutputUtxo.amount, 16).substring(2),
        toFixedHex(keypair.privkey).substring(2),
        toFixedHex(`0x${depositOutputUtxo.blinding}`).substring(2),
      ].join(':'),
      sourceChain: sourceChainId.toString(),
      sourceIdentifyingData: srcAddress,
      targetChain: destination.toString(),
      targetIdentifyingData: destAddress,
      tokenSymbol: tokenSymbol,
      version: 'v1',
      width: '5',
    };

    console.log('before generating the note: ', noteInput);

    const note = await Note.generateNote(noteInput);

    console.log('after generating the note');

    return {
      note: note,
      params: [depositOutputUtxo, anchorId, wrappableAssetAddress],
    };
  }

  deposit(depositPayload: DepositPayload): Transaction<NewNotesTxResult> {
    const { note } = depositPayload.note;
    const amount = depositPayload.params[0].amount;
    const formattedAmount = ethers.utils.formatUnits(amount, note.denomination);
    const srcChainId = note.sourceChainId;

    const destChainId = note.targetChainId;
    const currencySymbol = note.tokenSymbol;
    const wrappabledAssetAddress: string | undefined = depositPayload.params[2];

    const srcSymbol = wrappabledAssetAddress
      ? this.inner.config.getCurrencyByAddress(wrappabledAssetAddress).symbol
      : currencySymbol;

    const depositTx = Transaction.new<NewNotesTxResult>('Deposit', {
      wallets: { src: Number(srcChainId), dist: Number(destChainId) },
      tokens: [srcSymbol, currencySymbol],
      token: currencySymbol,
      amount: Number(formattedAmount),
    });

    const ex = async () => {
      const abortSignal = depositTx.cancelToken.abortSignal;
      const bridge = this.inner.methods.bridgeApi.getBridge();
      const currency = bridge?.currency;

      console.log('bridge: ', bridge);
      console.log('currency: ', currency);

      if (!bridge || !currency) {
        depositTx.fail('Api not ready');
      }

      try {
        const note = depositPayload.note.note;
        const utxo = depositPayload.params[0];

        const sourceEvmId = await this.inner.getChainId();
        const sourceChainId = calculateTypedChainId(ChainType.EVM, sourceEvmId);
        // Notification tx start
        const anchors = await this.bridgeApi.getAnchors();

        // Find the only configurable VAnchor
        const vanchor = anchors.find((anchor) => !anchor.amount);

        if (!vanchor) {
          depositTx.fail('No variable anchor configured for selected token');
        }

        // Get the contract address for the destination chain
        const srcAddress = vanchor.neighbours[sourceChainId] as string;

        if (!srcAddress) {
          depositTx.fail(`No Anchor for the chain ${note.targetChainId}`);
        }

        const srcVAnchor = this.inner.getVariableAnchorByAddress(srcAddress);
        const maxEdges = await srcVAnchor._contract.maxEdges();
        // Fetch the fixtures
        this.cancelToken.throwIfCancel();
        this.emit('stateChange', TransactionState.FetchingFixtures);
        const fixturesList = new Map<string, FixturesStatus>();
        fixturesList.set('VAnchorKey', 'Waiting');
        fixturesList.set('VAnchorWasm', 'Waiting');
        depositTx.next(TransactionState.FetchingFixtures, {
          fixturesList,
        });
        fixturesList.set('VAnchorKey', 0);
        const smallKey = await fetchVAnchorKeyFromAws(
          maxEdges,
          true,
          abortSignal
        );
        fixturesList.set('VAnchorKey', 'Done');
        fixturesList.set('VAnchorWasm', 0);
        const smallWasm = await fetchVAnchorWasmFromAws(
          maxEdges,
          true,
          abortSignal
        );
        fixturesList.set('VAnchorWasm', 'Done');
        const leavesMap: Record<string, Uint8Array[]> = {};

        // Fetch the leaves from the source chain
        depositTx.cancelToken.throwIfCancel();
        depositTx.next(TransactionState.FetchingLeaves, {
          end: undefined,
          currentRange: [0, 1],
          start: 0,
        });
        this.emit('stateChange', TransactionState.FetchingLeaves);
        let leafStorage = await bridgeStorageFactory(Number(sourceChainId));
        let leaves = await this.cancelToken.handleOrThrow(
          () =>
            this.inner.getVariableAnchorLeaves(
              srcVAnchor,
              leafStorage,
              abortSignal
            ),
          () => WebbError.from(WebbErrorCodes.TransactionCancelled)
        );
        // Only populate the leaves map if there are actually leaves to populate.
        if (leaves.length) {
          leavesMap[utxo.chainId] = leaves.map((leaf) => {
            return hexToU8a(leaf);
          });
        }

        // Set up a provider for the dest chain
        const destTypedChainId = Number(utxo.chainId);
        const destChainConfig = this.config.chains[destTypedChainId];
        const destHttpProvider = Web3Provider.fromUri(destChainConfig.url);
        const destEthers = destHttpProvider.intoEthersProvider();
        const destAddress = vanchor.neighbours[destTypedChainId] as string;
        const destVAnchor = this.inner.getVariableAnchorByAddressAndProvider(
          destAddress,
          destEthers
        );
        leafStorage = await bridgeStorageFactory(Number(utxo.chainId));

        leaves = await this.cancelToken.handleOrThrow(
          () =>
            this.inner.getVariableAnchorLeaves(
              destVAnchor,
              leafStorage,
              abortSignal
            ),
          () => WebbError.from(WebbErrorCodes.TransactionCancelled)
        );
        // Only populate the leaves map if there are actually leaves to populate.
        if (leaves.length) {
          leavesMap[utxo.chainId] = leaves.map((leaf) => {
            return hexToU8a(leaf);
          });
        }
        this.cancelToken.throwIfCancel();

        // Add the note to the noteManager before transaction is sent.
        // This helps to safeguard the user.
        if (this.inner.noteManager) {
          await this.inner.noteManager.addNote(depositPayload.note);
        }

        const currentWebbToken = await srcVAnchor.getWebbToken();

        // If the token / wrapUnwrapToken:
        // - is 0x0000000000000000000000000000000000000000 -> native token
        // - is equal to the FungibleTokenWrapper token -> no wrapping
        // - is equal to some random address / random ERC20 token -> wrap that token
        const tokenAddress =
          depositPayload.params[2] || currentWebbToken.address;

        // Check the approval status
        const isRequiredApproval = depositPayload.params[2]
          ? await srcVAnchor.isWrappableTokenApprovalRequired(
              depositPayload.params[2],
              amount
            )
          : await srcVAnchor.isWebbTokenApprovalRequired(amount);

        if (isRequiredApproval) {
          // Notification Waiting for approval notification
          depositTx.next(TransactionState.Intermediate, {
            name: 'Approval is required for depositing',
            data: {
              tokenAddress: depositPayload.params[2],
            },
          });

          // Get the token instance
          const tokenInstance = depositPayload.params[2]
            ? ERC20Factory.connect(
                depositPayload.params[2],
                this.inner.getEthersProvider().getSigner()
              )
            : currentWebbToken;

          const tx = await tokenInstance.approve(
            depositPayload.params[2]
              ? currentWebbToken.address
              : srcVAnchor.inner.address,
            amount
          );

          await tx.wait();
          depositTx.next(TransactionState.Intermediate, {
            name: 'Approved',
            data: {
              txHash: tx.hash,
            },
          });
        }

        // Checking for balance
        const enoughBalance = depositPayload.params[2]
          ? await srcVAnchor.hasEnoughBalance(
              depositPayload.params[0].amount,
              depositPayload.params[2]
            )
          : await srcVAnchor.hasEnoughBalance(amount);

        // Notification failed transaction if not enough balance
        if (!enoughBalance) {
          this.emit('stateChange', TransactionState.Failed);
          await this.inner.noteManager?.removeNote(depositPayload.note);
          depositTx.fail('Not enough balance');
        }

        this.emit('stateChange', TransactionState.GeneratingZk);
        depositTx.next(TransactionState.GeneratingZk, undefined);

        this.cancelToken.throwIfCancel();
        const worker = this.inner.wasmFactory();

        const tx = await this.cancelToken.handleOrThrow(
          () =>
            srcVAnchor.deposit(
              depositPayload.params[0] as CircomUtxo,
              tokenAddress,
              leavesMap,
              smallKey,
              Buffer.from(smallWasm),
              worker
            ),
          () => {
            worker.terminate();
            return WebbError.from(WebbErrorCodes.TransactionCancelled);
          }
        );

        this.emit('stateChange', TransactionState.SendingTransaction);
        depositTx.txHash = tx.hash;
        depositTx.next(TransactionState.SendingTransaction, tx.hash);

        // emit event for waiting for transaction to confirm
        const receipt = await tx.wait();

        // TODO: Make this parse the receipt for the index data
        const noteIndex = (await srcVAnchor.getNextIndex()) - 1;
        const indexedNote = await Note.deserialize(
          depositPayload.note.serialize()
        );
        indexedNote.mutateIndex(noteIndex.toString());
        await this.inner.noteManager.addNote(indexedNote);
        await this.inner.noteManager.removeNote(depositPayload.note);

        // Notification Success Transaction
        this.emit('stateChange', TransactionState.Done);
        depositTx.next(TransactionState.Done, {
          txHash: receipt.transactionHash,
          outputNotes: [indexedNote],
        });

        return {
          txHash: receipt.transactionHash,
          outputNotes: [indexedNote],
        };
      } catch (e: any) {
        console.log('Failed to handle the deposit flow: ', e);
        this.inner.notificationHandler.remove('waiting-approval');
        const isUserCancel =
          e instanceof WebbError &&
          e.code === WebbErrorCodes.TransactionCancelled;
        let description = '';

        if (e?.code === 4001) {
          description = 'User Rejected Deposit';
        } else if (isUserCancel) {
          description = 'User Cancelled Transaction';
        } else {
          description = 'Deposit Transaction Failed';
        }

        // Notification Failed transaction

        this.inner.noteManager?.removeNote(depositPayload.note);

        if (!isUserCancel) {
          this.emit('stateChange', TransactionState.Failed);
          depositTx.fail(description);
        }

        return {
          txHash: '',
          outputNotes: [],
        };
      }
    };

    depositTx.executor(ex);
    return depositTx;
  }
}
