import {
  MixerWithdraw,
  OptionalActiveRelayer,
  OptionalRelayer,
  WithdrawState,
} from '@webb-dapp/react-environment/webb-context';
import { WebbWeb3Provider } from '@webb-dapp/react-environment/api-providers/web3/webb-web3-provider';
import { transactionNotificationConfig } from '@webb-dapp/wallet/providers/polkadot/transaction-notification-config';
import { EvmNote } from '@webb-dapp/contracts/utils/evm-note';
import { evmIdIntoChainId } from '@webb-dapp/apps/configs';
import { WebbRelayer } from '@webb-dapp/react-environment/webb-context/relayer';
import React from 'react';

export class Web3MixerWithdraw extends MixerWithdraw<WebbWeb3Provider> {
  cancelWithdraw(): Promise<void> {
    return Promise.resolve(undefined);
  }

  async mapRelayerIntoActive(relayer: OptionalRelayer): Promise<OptionalActiveRelayer> {
    if (!relayer) {
      return null;
    }
    const evmId = await this.inner.getChainId();
    const chainId = evmIdIntoChainId(evmId);
    return WebbRelayer.intoActiveWebRelayer(relayer, {
      basedOn: 'evm',
      chain: chainId,
    });
  }

  get relayers() {
    return this.inner.getChainId().then((evmId) => {
      const chainId = evmIdIntoChainId(evmId);
      return this.inner.relayingManager.getRelayer({
        baseOn: 'evm',
        chainId,
      });
    });
  }

  get hasRelayer() {
    return this.relayers.then((r) => r.length > 0);
  }

  async withdraw(note: string, recipient: string): Promise<void> {
    this.emit('stateChange', WithdrawState.GeneratingZk);
    const evmNote = EvmNote.deserialize(note);
    const contract = await this.inner.getContractBySize(evmNote.amount, evmNote.currency);
    const txReset = await contract.withdraw(note, recipient);
    transactionNotificationConfig.loading?.({
      address: '',
      data: React.createElement('p', {}, 'Withdraw In Progress'),
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
