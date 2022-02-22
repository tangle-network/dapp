import {
  chainsConfig,
  ChainType,
  chainTypeIdToInternalId,
  computeChainIdType,
  currenciesConfig,
  evmIdIntoInternalChainId,
  getEVMChainNameFromInternal,
  InternalChainId,
  internalChainIdIntoEVMId,
  typeAndIdFromChainIdType,
} from '@webb-dapp/apps/configs';
import { WebbGovernedToken } from '@webb-dapp/contracts/contracts';
import { ERC20__factory } from '@webb-dapp/contracts/types';
import { createAnchor2Deposit, Deposit } from '@webb-dapp/contracts/utils/make-deposit';
import { DepositPayload as IDepositPayload, MixerSize } from '@webb-dapp/react-environment';
import { WebbWeb3Provider } from '@webb-dapp/react-environment/api-providers/web3/webb-web3-provider';
import { Currency } from '@webb-dapp/react-environment/webb-context/currency/currency';
import { notificationApi } from '@webb-dapp/ui-components/notification';
import { DepositNotification } from '@webb-dapp/ui-components/notification/DepositNotification';
import { transactionNotificationConfig } from '@webb-dapp/wallet/providers/polkadot/transaction-notification-config';
import { LoggerService } from '@webb-tools/app-util';
import { Note, NoteGenInput } from '@webb-tools/sdk-core';
import React from 'react';

import { u8aToHex } from '@polkadot/util';

import { BridgeDeposit } from '../../webb-context/bridge/bridge-deposit';

const logger = LoggerService.get('web3-bridge-deposit');

type DepositPayload = IDepositPayload<Note, [Deposit, number | string, string?]>;

export class Web3BridgeDeposit extends BridgeDeposit<WebbWeb3Provider, DepositPayload> {
  private get bridgeApi() {
    return this.inner.methods.bridgeApi;
  }

  async deposit(depositPayload: DepositPayload): Promise<void> {
    const bridge = this.bridgeApi.activeBridge;
    if (!bridge) {
      throw new Error('api not ready');
    }
    try {
      // Getting the active bridge
      const commitment = depositPayload.params[0].commitment;
      const note = depositPayload.note.note;
      const sourceEvmId = await this.inner.getChainId();
      const sourceChainId = computeChainIdType(ChainType.EVM, sourceEvmId);
      const sourceInternalId = evmIdIntoInternalChainId(sourceEvmId);
      transactionNotificationConfig.loading?.({
        address: '',
        data: React.createElement(DepositNotification, {
          chain: getEVMChainNameFromInternal(Number(sourceInternalId)),
          amount: Number(note.amount),
          currency: bridge.currency.view.name,
        }),
        key: 'bridge-deposit',
        path: {
          method: depositPayload.params[2] ? 'wrap and deposit' : 'deposit',
          section: bridge.currency.view.name,
        },
      });

      const anchors = await this.bridgeApi.getAnchors();
      // Find the Anchor for this bridge amount
      const anchor = anchors.find((anchor) => anchor.amount == note.amount);
      if (!anchor) {
        throw new Error('not Anchor for amount' + note.amount);
      }
      // Get the contract address for the destination chain
      const contractAddress = anchor.neighbours[sourceInternalId];
      if (!contractAddress) {
        throw new Error(`No Anchor for the chain ${note.targetChainId}`);
      }
      const contract = this.inner.getWebbAnchorByAddress(contractAddress as string);

      // If a wrappableAsset was selected, perform a wrapAndDeposit
      if (depositPayload.params[2]) {
        const requiredApproval = await contract.isWrappableTokenApprovalRequired(depositPayload.params[2]);
        if (requiredApproval) {
          notificationApi.addToQueue({
            message: 'Waiting for token approval',
            variant: 'info',
            key: 'waiting-approval',
            extras: { persist: true },
          });
          const tokenInstance = await ERC20__factory.connect(
            depositPayload.params[2],
            this.inner.getEthersProvider().getSigner()
          );
          const webbToken = await contract.getWebbToken();
          const tx = await tokenInstance.approve(webbToken.address, await contract.denomination);
          await tx.wait();
          notificationApi.remove('waiting-approval');
        }

        const enoughBalance = await contract.hasEnoughBalance(depositPayload.params[2]);
        if (enoughBalance) {
          await contract.wrapAndDeposit(commitment, depositPayload.params[2]);
          transactionNotificationConfig.finalize?.({
            address: '',
            data: undefined,
            key: 'bridge-deposit',
            path: {
              method: 'wrap and deposit',
              section: bridge.currency.view.name,
            },
          });
        } else {
          notificationApi.addToQueue({
            message: 'Not enough token balance',
            variant: 'error',
            key: 'waiting-approval',
          });
        }
        return;
      } else {
        const requiredApproval = await contract.isWebbTokenApprovalRequired();
        if (requiredApproval) {
          notificationApi.addToQueue({
            message: 'Waiting for token approval',
            variant: 'info',
            key: 'waiting-approval',
            extras: { persist: true },
          });
          const tokenInstance = await contract.getWebbToken();
          const tx = await tokenInstance.approve(contract.inner.address, await contract.denomination);
          await tx.wait();
          notificationApi.remove('waiting-approval');
        }

        const enoughBalance = await contract.hasEnoughBalance();
        if (enoughBalance) {
          await contract.deposit(String(commitment));
          transactionNotificationConfig.finalize?.({
            address: '',
            data: undefined,
            key: 'bridge-deposit',
            path: {
              method: 'deposit',
              section: bridge.currency.view.name,
            },
          });
        } else {
          notificationApi.addToQueue({
            message: 'Not enough token balance',
            variant: 'error',
            key: 'waiting-approval',
          });
        }
      }
    } catch (e: any) {
      console.log(e);
      if ((e as any)?.code == 4001) {
        notificationApi.remove('waiting-approval');
        transactionNotificationConfig.failed?.({
          address: '',
          data: 'User Rejected Deposit',
          key: 'bridge-deposit',

          path: {
            method: 'deposit',
            section: bridge.currency.view.name,
          },
        });
      } else {
        notificationApi.remove('waiting-approval');
        transactionNotificationConfig.failed?.({
          address: '',
          data: 'Deposit Transaction Failed',
          key: 'bridge-deposit',

          path: {
            method: 'deposit',
            section: bridge.currency.view.name,
          },
        });
      }
    }
  }

  async getSizes(): Promise<MixerSize[]> {
    const anchors = await this.bridgeApi.getAnchors();
    const currency = this.bridgeApi.currency;
    if (currency) {
      return anchors.map((anchor) => ({
        id: `Bridge=${anchor.amount}@${currency.view.name}`,
        title: `${anchor.amount} ${currency.view.name}`,
      }));
    }
    return [];
  }

  async getWrappableAssets(chainId: InternalChainId): Promise<Currency[]> {
    const bridge = this.bridgeApi.activeBridge;

    logger.log('getWrappableAssets of chain: ', chainId);
    if (bridge) {
      const wrappedTokenAddress = bridge.getTokenAddress(chainId);
      if (!wrappedTokenAddress) return [];

      // Get the available token addresses which can wrap into the wrappedToken
      const wrappedToken = new WebbGovernedToken(this.inner.getEthersProvider(), wrappedTokenAddress);
      const tokenAddresses = await wrappedToken.tokens;

      // TODO: dynamic wrappable assets - consider some Currency constructor via address & default token config.

      // If the tokenAddress matches one of the wrappableCurrencies, return it
      const wrappableCurrencyIds = chainsConfig[chainId].currencies.filter((currencyId) => {
        const wrappableTokenAddress = currenciesConfig[currencyId].addresses.get(chainId);
        return wrappableTokenAddress && tokenAddresses.includes(wrappableTokenAddress);
      });

      if (await wrappedToken.isNativeAllowed()) wrappableCurrencyIds.push(chainsConfig[chainId].nativeCurrencyId);

      const wrappableCurrencies = wrappableCurrencyIds.map((currencyId) => {
        return Currency.fromCurrencyId(currencyId);
      });

      return wrappableCurrencies;
    }
    return [];
  }

  /**
   * Generates a bridge note for the given mixer and target destination chain.
   * Note: If the wrappableAssetAddress is not provided, it is assumed to be
   *       the address of the webbToken
   * Note: This functione expects `destChainId` is EXPLICITLY the correctly computed
   *       target chain id with the type encoded in its value.
   * @param mixerId - the mixerId
   * @param destChainId - encoded destination chain Id and chain type
   * @param wrappableAssetAddress - the address of the token to wrap into the bridge
   * @returns
   */
  /*
   *
   *  Mixer id => the fixed deposit amount
   * destChainId => the Chain the token will be bridged to
   * If the wrappableAssetAddress is not provided, it is assumed to be the address of the webbToken
   * */
  async generateBridgeNote(
    mixerId: number | string,
    destChainId: number,
    wrappableAssetAddress?: string
  ): Promise<DepositPayload> {
    const bridge = this.bridgeApi.activeBridge;

    if (!bridge) {
      throw new Error('api not ready');
    }
    const tokenSymbol = bridge.currency.view.symbol;
    const sourceEvmId = await this.inner.getChainId();
    const sourceChainId = computeChainIdType(ChainType.EVM, sourceEvmId);
    const deposit = createAnchor2Deposit(destChainId);
    const srcChainInternal = evmIdIntoInternalChainId(sourceEvmId);
    const destChainInternal = chainTypeIdToInternalId(typeAndIdFromChainIdType(destChainId));
    const secrets = deposit.preimage;
    const target = bridge.getTokenAddress(destChainInternal);
    const srcAddress = bridge.getTokenAddress(srcChainInternal);
    console.log('mixerId: ', mixerId);
    const amount = String(mixerId).replace('Bridge=', '').split('@')[0];

    const noteInput: NoteGenInput = {
      exponentiation: '5',
      width: '3',
      protocol: 'anchor',
      chain: String(destChainId),
      sourceChain: String(sourceChainId),
      sourceIdentifyingData: srcAddress,
      targetIdentifyingData: target,
      amount: amount,
      denomination: '18',
      hashFunction: 'Poseidon',
      curve: 'Bn254',
      backend: 'Circom',
      version: 'v2',
      tokenSymbol: tokenSymbol,
      secrets: u8aToHex(secrets),
    };
    const note = await Note.generateNote(noteInput);
    logger.info(`Commitment is ${note.note.secrets}`);
    return {
      note: note,
      params: [deposit, mixerId, wrappableAssetAddress],
    };
  }
}
