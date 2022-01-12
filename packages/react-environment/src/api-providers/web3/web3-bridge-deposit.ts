import { ChainId, chainIdIntoEVMId, chainsConfig, currenciesConfig, evmIdIntoChainId, getEVMChainNameFromInternal } from '@webb-dapp/apps/configs';
import { createAnchor2Deposit, Deposit } from '@webb-dapp/contracts/utils/make-deposit';
import { WebbGovernedToken } from '@webb-dapp/contracts/contracts';
import { BridgeConfig, DepositPayload as IDepositPayload, MixerSize } from '@webb-dapp/react-environment';
import { WebbWeb3Provider } from '@webb-dapp/react-environment/api-providers/web3/webb-web3-provider';
import { notificationApi } from '@webb-dapp/ui-components/notification';
import { DepositNotification } from '@webb-dapp/ui-components/notification/DepositNotification';
import { transactionNotificationConfig } from '@webb-dapp/wallet/providers/polkadot/transaction-notification-config';
import { Note, NoteGenInput } from '@webb-tools/sdk-mixer';
import { logger } from 'ethers';
import React from 'react';

import { u8aToHex } from '@polkadot/util';

import { BridgeDeposit } from '../../webb-context/bridge/bridge-deposit';
import { Currency } from '@webb-dapp/react-environment/types/currency';
import { ERC20__factory } from '@webb-dapp/contracts/types';

type DepositPayload = IDepositPayload<Note, [Deposit, number | string, string?]>;

export class Web3BridgeDeposit extends BridgeDeposit<WebbWeb3Provider, DepositPayload> {
  bridgeConfig: BridgeConfig = {};

  async deposit(depositPayload: DepositPayload): Promise<void> {
    const bridge = this.activeBridge;
    if (!bridge) {
      throw new Error('api not ready');
    }
    try {
      // Getting the active bridge
      const commitment = depositPayload.params[0].commitment;
      const note = depositPayload.note.note;
      const sourceEvmId = await this.inner.getChainId();
      const sourceChainId = evmIdIntoChainId(sourceEvmId);
      transactionNotificationConfig.loading?.({
        address: '',
        data: React.createElement(DepositNotification, {
          chain: getEVMChainNameFromInternal(Number(note.sourceChain)),
          amount: Number(note.amount),
          currency: bridge.currency.name,
        }),
        key: 'bridge-deposit',
        path: {
          method: depositPayload.params[2] ? 'wrap and deposit' : 'deposit',
          section: bridge.currency.name,
        },
      });

      // Find the Anchor for this bridge amount
      const anchor = bridge.anchors.find((anchor) => anchor.amount == note.amount);
      if (!anchor) {
        throw new Error('not Anchor for amount' + note.amount);
      }
      // Get the contract address for the destination chain
      const contractAddress = anchor.anchorAddresses[sourceChainId];
      if (!contractAddress) {
        throw new Error(`No Anchor for the chain ${note.chain}`);
      }
      const contract = this.inner.getWebbAnchorByAddress(contractAddress);

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
          const tokenInstance = await ERC20__factory.connect(depositPayload.params[2], this.inner.getEthersProvider().getSigner());
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
              section: bridge.currency.name,
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
              section: bridge.currency.name,
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
      if (!e.code) {
        throw e;
      }
      if (e.code == 4001) {
        notificationApi.remove('waiting-approval');
        transactionNotificationConfig.failed?.({
          address: '',
          data: 'User Rejected Deposit',
          key: 'bridge-deposit',

          path: {
            method: 'deposit',
            section: bridge.currency.name,
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
            section: bridge.currency.name,
          },
        });
      }
    }
  }

  async getSizes(): Promise<MixerSize[]> {
    const bridge = this.activeBridge;
    if (bridge) {
      return bridge.anchors.map((anchor) => ({
        id: `Bridge=${anchor.amount}@${bridge.currency.name}`,
        title: `${anchor.amount} ${bridge.currency.name}`,
      }));
    }
    return [];
  }

  async getWrappableAssets(chainId: ChainId): Promise<Currency[]> {
    const bridge = this.activeBridge;
    if (bridge) {
      const wrappedTokenAddress = bridge.getTokenAddress(chainId);
      if (!wrappedTokenAddress) return [];

      const wrappedToken = new WebbGovernedToken(this.inner.getEthersProvider(), wrappedTokenAddress);
      const tokenAddresses = await wrappedToken.tokens;

      // take the currencies of the chain and return the ones that have addresses
      const wrappableAssets = chainsConfig[chainId].currencies.filter((currency) => {
        return tokenAddresses.find((tokenAddress) => tokenAddress === currency.address);
      });

      const wrappableCurrencies = wrappableAssets.map((asset) => {
        return Currency.fromCurrencyId(asset.currencyId);
      });

      const isNativeWrappable = await wrappedToken.isNativeAllowed();

      if (isNativeWrappable) {
        wrappableCurrencies.push(Currency.fromCurrencyId(chainsConfig[chainId].nativeCurrencyId));
      }

      return wrappableCurrencies;
    }
    return [];
  }

  /*
   *
   *  Mixer id => the fixed deposit amount
   * destChainId => the Chain the token will be bridged to
   * If the wrappableAssetAddress is not provided, it is assumed to be the address of the webbToken
   * */
  async generateBridgeNote(
    mixerId: number | string,
    destChainId: ChainId,
    wrappableAssetAddress?: string
  ): Promise<DepositPayload> {
    const bridge = this.activeBridge;
    if (!bridge) {
      throw new Error('api not ready');
    }
    const tokenSymbol = bridge.currency.name;
    const destEvmId = chainIdIntoEVMId(destChainId);
    const sourceEvmId = await this.inner.getChainId();
    const deposit = createAnchor2Deposit(destEvmId);
    const secrets = deposit.preimage;
    const amount = String(mixerId).replace('Bridge=', '').split('@')[0];
    const sourceChainId = evmIdIntoChainId(sourceEvmId);
    const noteInput: NoteGenInput = {
      prefix: 'webb.bridge',
      chain: String(destChainId),
      sourceChain: String(sourceChainId),
      amount: amount,
      denomination: '18',
      hashFunction: 'Poseidon',
      curve: 'Bn254',
      backend: 'Circom',
      version: 'v1',
      tokenSymbol: tokenSymbol,
      secrets: u8aToHex(secrets),
      exponentiation: '5',
      width: '3',
    };
    const note = await Note.generateNote(noteInput);
    logger.info(`Commitment is ${note.note.secret}`);
    return {
      note: note,
      params: [deposit, mixerId, wrappableAssetAddress],
    };
  }
}
