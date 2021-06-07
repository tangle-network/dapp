import { MixerWithdraw, WithdrawState } from '@webb-dapp/react-environment';
import { WebbWeb3Provider } from '@webb-dapp/react-environment/api-providers/web3/webb-web3-provider';
import { transactionNotificationConfig } from '@webb-dapp/wallet/providers/polkadot/transaction-notification-config';

export class Web3MixerWithdraw extends MixerWithdraw<WebbWeb3Provider> {
  private get contract() {
    return this.inner.currentContract();
  }

  cancelWithdraw(): Promise<void> {
    return Promise.resolve(undefined);
  }

  async withdraw(note: string, recipient: string): Promise<void> {
    this.emit('stateChange', WithdrawState.GeneratingZk);
    const txReset = await this.contract.withdraw(note, recipient);
    transactionNotificationConfig.loading?.({
      address: '',
      data: undefined,
      key: 'mixer-withdraw-evm',
      path: {
        method: 'withdraw',
        section: 'evm-mixer',
      },
    });
    this.emit('stateChange', WithdrawState.SendingTransaction);
    await txReset.wait();
    transactionNotificationConfig.finalize?.({
      address: '',
      data: undefined,
      key: 'mixer-withdraw-evm',
      path: {
        method: 'withdraw',
        section: 'evm-mixer',
      },
    });
    this.emit('stateChange', WithdrawState.Ideal);
  }
}
