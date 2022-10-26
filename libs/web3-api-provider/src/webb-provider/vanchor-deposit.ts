// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  DepositPayload as IDepositPayload,
  NewNotesTxResult,
  TransactionState,
  VAnchorDeposit,
} from '@nepoche/abstract-api-provider';
import { bridgeStorageFactory } from '@nepoche/browser-utils/storage';
import { WebbError, WebbErrorCodes } from '@nepoche/dapp-types';
import { fetchVAnchorKeyFromAws, fetchVAnchorWasmFromAws } from '@nepoche/fixtures-deployments';
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

export class Web3VAnchorDeposit extends VAnchorDeposit<WebbWeb3Provider, DepositPayload> {
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
    const bnAmount = ethers.utils.parseUnits(amount.toString(), currency.getDecimals()).toString();
    const tokenSymbol = currency.view.symbol;
    const sourceEvmId = await this.inner.getChainId();
    const sourceChainId = calculateTypedChainId(ChainType.EVM, sourceEvmId);

    const keypair = this.inner.noteManager ? this.inner.noteManager.getKeypair() : new Keypair();

    // Convert the amount to units of wei
    const depositOutputUtxo = await CircomUtxo.generateUtxo({
      curve: 'Bn254',
      backend: 'Circom',
      amount: bnAmount,
      originChainId: sourceChainId.toString(),
      chainId: destination.toString(),
      keypair,
    });

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
        toFixedHex(keypair.privkey!).substring(2),
        toFixedHex(depositOutputUtxo.blinding).substring(2),
      ].join(':'),
      sourceChain: sourceChainId.toString(),
      sourceIdentifyingData: srcAddress!,
      targetChain: destination.toString(),
      targetIdentifyingData: destAddress!,
      tokenSymbol: tokenSymbol,
      version: 'v1',
      width: '4',
    };

    const note = await Note.generateNote(noteInput);

    return {
      note: note,
      params: [depositOutputUtxo, anchorId, wrappableAssetAddress],
    };
  }

  // TODO: implement the return result
  async deposit(depositPayload: DepositPayload): Promise<NewNotesTxResult> {
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
    const bridge = this.inner.methods.bridgeApi.getBridge();
    const currency = bridge?.currency;

    if (!bridge || !currency) {
      throw new Error('api not ready');
    }

    try {
      const note = depositPayload.note.note;
      const utxo = depositPayload.params[0];

      const amount = depositPayload.params[0].amount;

      const sourceEvmId = await this.inner.getChainId();
      const sourceChainId = calculateTypedChainId(ChainType.EVM, sourceEvmId);

      this.inner.notificationHandler({
        data: {
          amount: ethers.utils.formatUnits(note.amount, note.denomination),
          chain: this.inner.config.getEVMChainName(sourceEvmId),
          currency: currency.view.name,
        },
        description: 'Depositing',
        key: 'bridge-deposit',
        level: 'loading',
        message: `bridge:${depositPayload.params[2] ? 'wrap and deposit' : 'deposit'}`,
        name: 'Transaction',
      });

      const anchors = await this.bridgeApi.getAnchors();

      // Find the only configurable VAnchor
      const vanchor = anchors.find((anchor) => !anchor.amount);

      if (!vanchor) {
        throw new Error('No variable anchor configured for token');
      }

      // Get the contract address for the destination chain
      const srcAddress = vanchor.neighbours[sourceChainId] as string;

      if (!srcAddress) {
        throw new Error(`No Anchor for the chain ${note.targetChainId}`);
      }

      const srcVAnchor = await this.inner.getVariableAnchorByAddress(srcAddress);
      const maxEdges = await srcVAnchor._contract.maxEdges();
      // Fetch the fixtures
      this.cancelToken.throwIfCancel();
      this.emit('stateChange', TransactionState.FetchingFixtures);
      const smallKey = await fetchVAnchorKeyFromAws(maxEdges, true, abortSignal);
      const smallWasm = await fetchVAnchorWasmFromAws(maxEdges, true, abortSignal);
      const leavesMap: Record<string, Uint8Array[]> = {};

      // Fetch the leaves from the source chain
      this.cancelToken.throwIfCancel();
      this.emit('stateChange', TransactionState.FetchingLeaves);
      let leafStorage = await bridgeStorageFactory(Number(sourceChainId));
      let leaves = await this.cancelToken.handleOrThrow(
        () => this.inner.getVariableAnchorLeaves(srcVAnchor, leafStorage, abortSignal),
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
      const destVAnchor = await this.inner.getVariableAnchorByAddressAndProvider(destAddress, destEthers);
      leafStorage = await bridgeStorageFactory(Number(utxo.chainId));

      leaves = await this.cancelToken.handleOrThrow(
        () => this.inner.getVariableAnchorLeaves(destVAnchor, leafStorage, abortSignal),
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

      this.emit('stateChange', TransactionState.GeneratingZk);

      // If a wrappableAsset was selected, perform a wrapAndDeposit
      if (depositPayload.params[2]) {
        const requiredApproval = await srcVAnchor.isWrappableTokenApprovalRequired(depositPayload.params[2], amount);

        if (requiredApproval) {
          this.inner.notificationHandler({
            description: 'Waiting for token approval',
            key: 'waiting-approval',
            level: 'info',
            message: 'Waiting for token approval',
            name: 'Transaction',
            persist: true,
          });
          const tokenInstance = await ERC20Factory.connect(
            depositPayload.params[2],
            this.inner.getEthersProvider().getSigner()
          );
          const webbToken = await srcVAnchor.getWebbToken();
          const tx = await tokenInstance.approve(webbToken.address, amount);

          await tx.wait();
          this.inner.notificationHandler.remove('waiting-approval');
        }

        const enoughBalance = await srcVAnchor.hasEnoughBalance(
          depositPayload.params[0].amount,
          depositPayload.params[2]
        );

        if (enoughBalance) {
          this.cancelToken.throwIfCancel();
          const worker = this.inner.wasmFactory();

          const tx = await this.cancelToken.handleOrThrow(
            () =>
              srcVAnchor.wrapAndDeposit(
                depositPayload.params[2] as string,
                depositPayload.params[0] as CircomUtxo,
                leavesMap,
                smallKey,
                Buffer.from(smallWasm),
                worker!
              ),
            () => {
              worker?.terminate();
              return WebbError.from(WebbErrorCodes.TransactionCancelled);
            }
          );

          this.emit('stateChange', TransactionState.SendingTransaction);

          // emit event for waiting for transaction to confirm
          const receipt = await tx.wait();

          this.inner.notificationHandler({
            data: {
              amount: ethers.utils.formatUnits(note.amount, note.denomination),
              chain: this.inner.config.getEVMChainName(sourceEvmId),
              currency: currency.view.name,
            },
            description: 'Depositing',
            key: 'bridge-deposit',
            level: 'success',
            message: `${currency.view.name}:wrap and deposit`,
            name: 'Transaction',
          });

          this.emit('stateChange', TransactionState.Done);
          return {
            txHash: receipt.transactionHash,
            outputNotes: [depositPayload.note],
          };
        } else {
          this.inner.notificationHandler({
            data: {
              amount: ethers.utils.formatUnits(note.amount, note.denomination),
              chain: this.inner.config.getEVMChainName(sourceEvmId),
              currency: currency.view.name,
            },
            description: 'Not enough token balance',
            key: 'bridge-deposit',
            level: 'error',
            message: `${currency.view.name}:wrap and deposit`,
            name: 'Transaction',
          });
          this.emit('stateChange', TransactionState.Failed);
          this.inner.noteManager?.removeNote(depositPayload.note);

          return {
            txHash: '',
            outputNotes: [],
          };
        }
      } else {
        const requiredApproval = await srcVAnchor.isWebbTokenApprovalRequired(amount);

        if (requiredApproval) {
          this.inner.notificationHandler({
            description: 'Waiting for token approval',
            key: 'waiting-approval',
            level: 'info',
            message: 'Waiting for token approval',
            name: 'Transaction',
            persist: true,
          });
          const tokenInstance = await srcVAnchor.getWebbToken();
          const tx = await tokenInstance.approve(srcVAnchor.inner.address, amount);

          await tx.wait();
          this.inner.notificationHandler.remove('waiting-approval');
        }

        const enoughBalance = await srcVAnchor.hasEnoughBalance(amount);

        if (enoughBalance) {
          this.cancelToken.throwIfCancel();
          const worker = this.inner.wasmFactory();

          const tx = await this.cancelToken.handleOrThrow(
            () =>
              srcVAnchor.deposit(
                depositPayload.params[0] as CircomUtxo,
                leavesMap,
                smallKey,
                Buffer.from(smallWasm),
                worker!
              ),
            () => {
              worker?.terminate();
              return WebbError.from(WebbErrorCodes.TransactionCancelled);
            }
          );

          this.emit('stateChange', TransactionState.SendingTransaction);

          // emit event for waiting for transaction to confirm
          const receipt = await tx.wait();

          this.inner.notificationHandler({
            data: {
              amount: ethers.utils.formatUnits(note.amount, note.denomination),
              chain: this.inner.config.getEVMChainName(sourceEvmId),
              currency: currency.view.name,
            },
            description: 'Depositing',
            key: 'bridge-deposit',
            level: 'success',
            message: `${currency.view.name} deposit`,
            name: 'Transaction',
          });

          this.emit('stateChange', TransactionState.Done);
          return {
            txHash: receipt.transactionHash,
            outputNotes: [depositPayload.note],
          };
        } else {
          this.inner.notificationHandler({
            data: {
              amount: ethers.utils.formatUnits(note.amount, note.denomination),
              chain: this.inner.config.getEVMChainName(sourceEvmId),
              currency: currency.view.name,
            },
            description: 'Not enough token balance',
            key: 'bridge-deposit',
            level: 'error',
            message: 'Not enough token balance',
            name: 'Transaction',
          });

          this.inner.noteManager?.removeNote(depositPayload.note);
          this.emit('stateChange', TransactionState.Failed);

          return {
            txHash: '',
            outputNotes: [],
          };
        }
      }
    } catch (e: any) {
      this.inner.notificationHandler.remove('waiting-approval');
      const isUserCancel = e instanceof WebbError && e.code === WebbErrorCodes.TransactionCancelled;
      let description = '';

      if (e?.code === 4001) {
        description = 'User Rejected Deposit';
      } else if (isUserCancel) {
        description = 'User Cancelled Transaction';
      } else {
        description = 'Deposit Transaction Failed';
      }

      this.inner.notificationHandler({
        description,
        key: 'bridge-deposit',
        level: 'error',
        message: `${currency.view.name}:deposit`,
        name: 'Transaction',
      });

      this.inner.noteManager?.removeNote(depositPayload.note);

      if (!isUserCancel) {
        this.emit('stateChange', TransactionState.Failed);
      }

      return {
        txHash: '',
        outputNotes: [],
      };
    }
  }
}
