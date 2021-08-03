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
import { RelayedWithdrawResult, WebbRelayer } from '@webb-dapp/react-environment/webb-context/relayer';
import React from 'react';
import { chainIdToRelayerName } from '@webb-dapp/apps/configs/relayer-config';
import { bufferToFixed } from '@webb-dapp/contracts/utils/buffer-to-fixed';

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
    const activeRelayer = this.activeRelayer[0];
    if (activeRelayer) {
      // relayer flow
      const evmNote = EvmNote.deserialize(note);
      const deposit = evmNote.intoDeposit();
      const realyedWithdraw = await activeRelayer.initWithdraw();
      const mixerInfo = this.inner.getMixerInfoBySize(evmNote.amount, evmNote.currency);
      const anchorContract = await this.inner.getContractByAddress(mixerInfo.address);
      const zkp = await anchorContract.generateZKP(evmNote, recipient);
      const tx = realyedWithdraw.generateWithdrawRequest(
        {
          baseOn: 'evm',
          name: chainIdToRelayerName(evmNote.chainId),
          contractAddress: mixerInfo.address,
          endpoint: '',
        },
        zkp.proof,
        {
          fee: bufferToFixed(activeRelayer.fee || 0),
          nullifierHash: bufferToFixed(deposit.nullifierHash),
          recipient,
          refund: '',
          relayer: activeRelayer.address,
          root: bufferToFixed(zkp.input.root),
        }
      );
      realyedWithdraw.watcher.subscribe((nextValue) => {
        console.log(nextValue);
        switch (nextValue) {
          case RelayedWithdrawResult.PreFlight:
            break;
          case RelayedWithdrawResult.OnFlight:
            break;
          case RelayedWithdrawResult.Continue:
            break;
          case RelayedWithdrawResult.CleanExit:
            break;
          case RelayedWithdrawResult.Errored:
            break;
        }
      });
      realyedWithdraw.send(tx);
    } else {
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
}
