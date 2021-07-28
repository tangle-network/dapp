import { MixerWithdraw, WithdrawState } from '@webb-dapp/react-environment/webb-context';
import { WebbWeb3Provider } from '@webb-dapp/react-environment/api-providers/web3/webb-web3-provider';
import { transactionNotificationConfig } from '@webb-dapp/wallet/providers/polkadot/transaction-notification-config';
import { EvmNote } from '@webb-dapp/contracts/utils/evm-note';
import { evmIdIntoChainId } from '@webb-dapp/apps/configs';

export class Web3MixerWithdraw extends MixerWithdraw<WebbWeb3Provider> {
  cancelWithdraw(): Promise<void> {
    return Promise.resolve(undefined);
  }

  get hasRelayer() {
    return this.inner.getChainId().then((evmId) => {
      const chainId = evmIdIntoChainId(evmId);
      const relayers = this.inner.relayingManager.getRelayer({
        baseOn: 'evm',
        chainId,
      });
      return relayers.length > 0;
    });
  }

  async withdraw(note: string, recipient: string): Promise<void> {
    this.emit('stateChange', WithdrawState.GeneratingZk);
    const evmNote = EvmNote.deserialize(note);
    const contract = await this.inner.getContractBySize(evmNote.amount, evmNote.currency);
    const txReset = await contract.withdraw(note, recipient);
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
