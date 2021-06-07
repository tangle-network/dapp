import { EvmNote } from '@webb-dapp/contracts/utils/evm-note';
import { Deposit } from '@webb-dapp/contracts/utils/make-deposit';
import { DepositPayload as IDepositPayload, MixerDeposit, MixerSize } from '@webb-dapp/react-environment';

import { WebbWeb3Provider } from './webb-web3-provider';
import { transactionNotificationConfig } from '@webb-dapp/wallet/providers/polkadot/transaction-notification-config';

type DepositPayload = IDepositPayload<EvmNote, Deposit>;

export class Web3MixerDeposit extends MixerDeposit<WebbWeb3Provider, DepositPayload> {
  private get contract() {
    return this.inner.currentContract();
  }

  async deposit(depositPayload: DepositPayload): Promise<void> {
    transactionNotificationConfig.loading?.({
      address: '',
      data: undefined,
      key: 'mixer-deposit-evm',
      path: {
        method: 'deposit',
        section: 'evm-mixer',
      },
    });
    const deposit = depositPayload.params;
    await this.contract.deposit(deposit.commitment);
    transactionNotificationConfig.finalize?.({
      address: '',
      data: undefined,
      key: `deposit success`,
      path: {
        method: 'deposit',
        section: 'evm-mixer',
      },
    });
  }

  async generateNote(mixerId: number): Promise<DepositPayload> {
    const depositPayload = await this.contract.createDeposit();
    return {
      note: depositPayload.note,
      params: depositPayload.deposit,
    };
  }

  getSizes(): Promise<MixerSize[]> {
    return Promise.resolve([]);
  }
}
