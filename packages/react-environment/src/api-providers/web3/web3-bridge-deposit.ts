import { ChainId, chainIdIntoEVMId, evmIdIntoChainId, getEVMChainNameFromInternal } from '@webb-dapp/apps/configs';
import { createAnchor2Deposit, Deposit } from '@webb-dapp/contracts/utils/make-deposit';
import { BridgeConfig, DepositPayload as IDepositPayload, MixerSize } from '@webb-dapp/react-environment';
import { WebbWeb3Provider } from '@webb-dapp/react-environment/api-providers/web3/webb-web3-provider';
import { Note, NoteGenInput } from '@webb-tools/sdk-mixer';
import { Erc20 } from '@webb-dapp/contracts/types/Erc20';
import { u8aToHex } from '@polkadot/util';

import { BridgeDeposit } from '../../webb-context/bridge/bridge-deposit';
import { transactionNotificationConfig } from '@webb-dapp/wallet/providers/polkadot/transaction-notification-config';
import React from 'react';
import { DepositNotification } from '@webb-dapp/ui-components/notification/DepositNotification';
import { notificationApi } from '@webb-dapp/ui-components/notification';
import { logger } from 'ethers';

type DepositPayload = IDepositPayload<Note, [Deposit, number | string]>;

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
          method: 'deposit',
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

      logger.info(`Commitment for deposit is ${commitment}`);

      const tokenInstance = await contract.checkForApprove();
      console.log("tokenInstance", tokenInstance);
      if (tokenInstance != null) {
        notificationApi.addToQueue({
          message: 'Waiting for token approval',
          variant: 'info',
          key: 'waiting-approval',
          extras: { persist: true }
        });
        await contract.approve(tokenInstance);
        notificationApi.remove('waiting-approval');
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
    } catch (e) {
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
        title: `${anchor.amount} ${bridge.currency.prefix}`,
      }));
    }
    return [];
  }

  /*
   *
   *  Mixer id => the fixed deposit amount
   * destChainId => the Chain the token will be bridged to
   * */
  async generateBridgeNote(mixerId: number | string, destChainId: ChainId): Promise<DepositPayload> {
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
    };
    const note = await Note.generateNote(noteInput);
    logger.info(`Commitment is ${note.note.secret}`);
    return {
      note: note,
      params: [deposit, mixerId],
    };
  }
}
