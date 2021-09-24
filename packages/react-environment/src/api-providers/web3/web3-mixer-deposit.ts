import { ChainId, chainIdIntoEVMId, evmIdIntoChainId } from '@webb-dapp/apps/configs';
import { getEVMChainName, getNativeCurrencySymbol } from '@webb-dapp/apps/configs/evm/SupportedMixers';
import { createTornDeposit, Deposit } from '@webb-dapp/contracts/utils/make-deposit';
import { DepositPayload as IDepositPayload, MixerDeposit, MixerSize } from '@webb-dapp/react-environment/webb-context';
import { DepositNotification } from '@webb-dapp/ui-components/notification/DepositNotification';
import { transactionNotificationConfig } from '@webb-dapp/wallet/providers/polkadot/transaction-notification-config';
import { Note, NoteGenInput } from '@webb-tools/sdk-mixer';
import React from 'react';
import utils from 'web3-utils';

import { u8aToHex } from '@polkadot/util';

import { WebbWeb3Provider } from './webb-web3-provider';

type DepositPayload = IDepositPayload<Note, [Deposit, number]>;

export class Web3MixerDeposit extends MixerDeposit<WebbWeb3Provider, DepositPayload> {
  async deposit({ note: depositPayload, params }: DepositPayload): Promise<void> {
    const chainId = Number(depositPayload.note.chain) as ChainId;
    const evmChainId = chainIdIntoEVMId(chainId);
    transactionNotificationConfig.loading?.({
      address: '',
      data: React.createElement(DepositNotification, {
        chain: getEVMChainName(evmChainId),
        amount: Number(depositPayload.note.amount),
        currency: depositPayload.note.tokenSymbol,
      }),
      key: 'mixer-deposit-evm',
      path: {
        method: 'deposit',
        section: 'evm-mixer',
      },
    });
    const [deposit, amount] = params;
    const contract = await this.inner.getContractBySize(amount, getNativeCurrencySymbol(await this.inner.getChainId()));
    console.log(deposit.commitment);
    try {
      await contract.deposit(deposit.commitment);
      transactionNotificationConfig.finalize?.({
        address: '',
        data: undefined,
        key: `mixer-deposit-evm`,
        path: {
          method: 'deposit',
          section: 'evm-mixer',
        },
      });
    } catch (e) {
      console.log(e);
      if (e.code == 4001) {
        transactionNotificationConfig.failed?.({
          address: '',
          data: 'User Rejected Deposit',
          key: `mixer-deposit-evm`,
          path: {
            method: 'deposit',
            section: 'evm-mixer',
          },
        });
      } else {
        transactionNotificationConfig.failed?.({
          address: '',
          data: 'Deposit Transaction Failed',
          key: `mixer-deposit-evm`,
          path: {
            method: 'deposit',
            section: 'evm-mixer',
          },
        });
      }
    }
  }

  async generateNote(mixerAddress: string): Promise<DepositPayload> {
    const contract = await this.inner.getContractByAddress(mixerAddress);
    const mixerInfo = this.inner.getMixers().getMixerInfoByAddress(mixerAddress);

    if (!mixerInfo) {
      throw new Error(`mixer not found from storage`);
    }
    const depositSizeBN = await contract.denomination;
    const depositSize = Number.parseFloat(utils.fromWei(depositSizeBN.toString(), 'ether'));
    const chainId = await this.inner.getChainId();
    const deposit = createTornDeposit();
    const noteChain = String(evmIdIntoChainId(chainId));
    const secrets = deposit.preimage;
    const noteInput: NoteGenInput = {
      prefix: 'webb.mix',
      chain: noteChain,
      sourceChain: noteChain,
      amount: String(depositSize),
      denomination: '18',
      hashFunction: 'Poseidon',
      curve: 'Bn254',
      backend: 'Circom',
      version: 'v1',
      tokenSymbol: mixerInfo.symbol,
      secrets: u8aToHex(secrets),
    };
    const note = await Note.generateNote(noteInput);

    return {
      note: note,
      params: [deposit, mixerInfo.size],
    };
  }

  async getSizes(): Promise<MixerSize[]> {
    return this.inner.getMixerSizes(getNativeCurrencySymbol(await this.inner.getChainId()));
  }
}
