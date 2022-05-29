// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unused-vars */

import { VAnchor } from '@webb-tools/anchors';
import { ERC20__factory as ERC20Factory } from '@webb-tools/contracts';
import { Note, NoteGenInput } from '@webb-tools/sdk-core';
import { Keypair, randomBN, toFixedHex, Utxo } from '@webb-tools/utils';
import { BigNumber, ethers } from 'ethers';

import { DepositPayload as IDepositPayload, MixerSize, VAnchorDeposit } from '../abstracts';
import {
  ChainType,
  chainTypeIdToInternalId,
  computeChainIdType,
  evmIdIntoInternalChainId,
  parseChainIdType,
} from '../chains';
import { getEVMChainNameFromInternal, keypairStorageFactory } from '..';
import { WebbWeb3Provider } from './webb-provider';

type DepositPayload = IDepositPayload<Note, [Utxo, number | string, string?]>;

export class Web3VAnchorDeposit extends VAnchorDeposit<WebbWeb3Provider, DepositPayload> {
  // For VAnchor, the getSizes will describe the minimum deposit amount for the vanchor
  async getSizes(): Promise<MixerSize[]> {
    const anchors = await this.bridgeApi.getAnchors();
    const currency = this.bridgeApi.currency;

    if (currency) {
      return anchors
        .filter((anchor) => !anchor.amount)
        .map((anchor) => ({
          // Hardcoded minimum size
          amount: 0.00001,
          asset: currency.view.symbol,
          id: `Bridge=${anchor.amount}@${currency.view.name}`,
          title: `${anchor.amount} ${currency.view.name}`,
        }));
    }

    return [];
  }

  async generateBridgeNote(
    anchorId: string | number,
    destination: number,
    amount: number,
    wrappableAssetAddress?: string
  ): Promise<DepositPayload> {
    const bridge = this.bridgeApi.activeBridge;
    const currency = this.bridgeApi.currency;

    if (!bridge || !currency) {
      throw new Error('api not ready');
    }

    const tokenSymbol = currency.view.symbol;
    const sourceEvmId = await this.inner.getChainId();
    const sourceChainId = computeChainIdType(ChainType.EVM, sourceEvmId);

    // TODO: Find a better way to manage keypair
    const keypairStorage = await keypairStorageFactory();
    const storedKeypair = await keypairStorage.get('keypair');

    let keypair: Keypair;

    if (storedKeypair) {
      // If keypair was already in storage, use it
      keypair = new Keypair(storedKeypair.keypair);
    } else {
      // Otherwise, create a new keypair and store it
      keypair = new Keypair();
      await keypairStorage.set('keypair', { keypair: keypair.privkey });
    }

    // Convert the amount to units of wei
    const depositOutputUtxo = VAnchor.generateUTXO({
      amount: BigNumber.from(ethers.utils.parseEther(amount.toString())),
      blinding: randomBN(),
      chainId: BigNumber.from(destination),
      index: 0,
      keypair,
    });

    const srcChainInternal = evmIdIntoInternalChainId(sourceEvmId);
    const destChainInternal = chainTypeIdToInternalId(parseChainIdType(destination));
    const anchorConfig = bridge.anchors.find((anchorConfig) => anchorConfig.type === 'variable');

    if (!anchorConfig) {
      throw new Error(`cannot find anchor configuration with amount: ${amount}`);
    }

    const srcAddress = anchorConfig.anchorAddresses[srcChainInternal];
    const destAddress = anchorConfig.anchorAddresses[destChainInternal];

    const noteInput: NoteGenInput = {
      amount: amount.toString(),
      backend: 'Circom',
      curve: 'Bn254',
      denomination: '18',
      exponentiation: '5',
      hashFunction: 'Poseidon',
      protocol: 'vanchor',
      secrets: `${toFixedHex(destination, 6).substring(2)}:${BigNumber.from(
        depositOutputUtxo.amount
      ).toHexString()}:${depositOutputUtxo.keypair.pubkey.toHexString()}:${BigNumber.from(
        depositOutputUtxo.blinding
      ).toHexString()}`,
      sourceChain: sourceChainId.toString(),
      sourceIdentifyingData: srcAddress,
      targetChain: destination.toString(),
      targetIdentifyingData: destAddress,
      tokenSymbol: tokenSymbol,
      version: 'v2',
      width: '4',
    };

    const note = await Note.generateNote(noteInput);

    return {
      note: note,
      params: [depositOutputUtxo, anchorId, wrappableAssetAddress],
    };
  }

  async deposit(depositPayload: DepositPayload): Promise<void> {
    const bridge = this.bridgeApi.activeBridge;
    const currency = this.bridgeApi.currency;

    if (!bridge || !currency) {
      throw new Error('api not ready');
    }

    try {
      const note = depositPayload.note.note;
      const amount = depositPayload.params[0].amount;
      const sourceEvmId = await this.inner.getChainId();
      const sourceInternalId = evmIdIntoInternalChainId(sourceEvmId);

      this.inner.notificationHandler({
        data: {
          amount: note.amount,
          chain: getEVMChainNameFromInternal(this.inner.config, Number(sourceInternalId)),
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
      const contractAddress = vanchor.neighbours[sourceInternalId];

      if (!contractAddress) {
        throw new Error(`No Anchor for the chain ${note.targetChainId}`);
      }

      const vanchorWrapper = await this.inner.getVariableAnchorByAddress(contractAddress as string);

      // If a wrappableAsset was selected, perform a wrapAndDeposit
      if (depositPayload.params[2]) {
        const requiredApproval = await vanchorWrapper.isWrappableTokenApprovalRequired(
          depositPayload.params[2],
          amount
        );

        if (requiredApproval) {
          this.inner.notificationHandler({
            description: 'Waiting for token approval',
            key: 'waiting-approval',
            level: 'info',
            message: 'Waiting for token approval',
            name: 'Approval',
            persist: true,
          });
          const tokenInstance = await ERC20Factory.connect(
            depositPayload.params[2],
            this.inner.getEthersProvider().getSigner()
          );
          const webbToken = await vanchorWrapper.getWebbToken();
          const tx = await tokenInstance.approve(webbToken.address, amount);

          await tx.wait();
          this.inner.notificationHandler.remove('waiting-approval');
        }

        const enoughBalance = await vanchorWrapper.hasEnoughBalance(depositPayload.params[2]);

        if (enoughBalance) {
          await vanchorWrapper.wrapAndDeposit(depositPayload.params[0], depositPayload.params[2]);

          this.inner.notificationHandler({
            data: {
              amount: note.amount,
              chain: getEVMChainNameFromInternal(this.inner.config, Number(sourceInternalId)),
              currency: currency.view.name,
            },
            description: 'Depositing',
            key: 'bridge-deposit',
            level: 'success',
            message: `${currency.view.name}:wrap and deposit`,
            name: 'Transaction',
          });
        } else {
          this.inner.notificationHandler({
            data: {
              amount: note.amount,
              chain: getEVMChainNameFromInternal(this.inner.config, Number(sourceInternalId)),
              currency: currency.view.name,
            },
            description: 'Not enough token balance',
            key: 'bridge-deposit',
            level: 'error',
            message: `${currency.view.name}:wrap and deposit`,
            name: 'Transaction',
          });
        }

        return;
      } else {
        const requiredApproval = await vanchorWrapper.isWebbTokenApprovalRequired(amount);

        if (requiredApproval) {
          this.inner.notificationHandler({
            description: 'Waiting for token approval',
            key: 'waiting-approval',
            level: 'info',
            message: 'Waiting for token approval',
            name: 'Approval',
            persist: true,
          });
          const tokenInstance = await vanchorWrapper.getWebbToken();
          const tx = await tokenInstance.approve(vanchorWrapper.inner.address, amount);

          await tx.wait();
          this.inner.notificationHandler.remove('waiting-approval');
        }

        const enoughBalance = await vanchorWrapper.hasEnoughBalance(amount);

        if (enoughBalance) {
          await vanchorWrapper.deposit(depositPayload.params[0]);
          this.inner.notificationHandler({
            data: {
              amount: note.amount,
              chain: getEVMChainNameFromInternal(this.inner.config, Number(sourceInternalId)),
              currency: currency.view.name,
            },
            description: 'Depositing',
            key: 'bridge-deposit',
            level: 'success',
            message: `${currency.view.name} deposit`,
            name: 'Transaction',
          });
        } else {
          this.inner.notificationHandler({
            data: {
              amount: note.amount,
              chain: getEVMChainNameFromInternal(this.inner.config, Number(sourceInternalId)),
              currency: currency.view.name,
            },
            description: 'Not enough token balance',
            key: 'bridge-deposit',
            level: 'error',
            message: 'Not enough token balance',
            name: 'Transaction',
          });
        }
      }
    } catch (e: any) {
      console.log(e);

      if (e?.code === 4001) {
        this.inner.notificationHandler.remove('waiting-approval');
        this.inner.notificationHandler({
          description: 'user rejected deposit',
          key: 'bridge-deposit',
          level: 'error',
          message: `${currency.view.name}:deposit`,
          name: 'Transaction',
        });
      } else {
        this.inner.notificationHandler.remove('waiting-approval');
        this.inner.notificationHandler({
          description: 'Deposit Transaction Failed',
          key: 'bridge-deposit',
          level: 'error',
          message: `${currency.view.name}:deposit`,
          name: 'Transaction',
        });
      }
    }
  }
}
