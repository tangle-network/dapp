import { evmIdIntoChainId } from '@webb-dapp/apps/configs';
import { chainIdToRelayerName } from '@webb-dapp/apps/configs/relayer-config';
import { bufferToFixed } from '@webb-dapp/contracts/utils/buffer-to-fixed';
import { EvmNote } from '@webb-dapp/contracts/utils/evm-note';
import { WebbWeb3Provider } from '@webb-dapp/react-environment/api-providers/web3/webb-web3-provider';
import {
  MixerWithdraw,
  OptionalActiveRelayer,
  OptionalRelayer,
  WithdrawState,
} from '@webb-dapp/react-environment/webb-context';
import { RelayedWithdrawResult, WebbRelayer } from '@webb-dapp/react-environment/webb-context/relayer';
import { transactionNotificationConfig } from '@webb-dapp/wallet/providers/polkadot/transaction-notification-config';
import React from 'react';
import { LoggerService } from '@webb-tools/app-util';

const logger = LoggerService.get('Web3MixerWithdraw');

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
      const relayers = this.inner.relayingManager.getRelayer({});
      console.log({ relayers });
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
      logger.info(`Withdrawing throw relayer with address ${activeRelayer.address}`);
      const evmNote = EvmNote.deserialize(note);
      const deposit = evmNote.intoDeposit();
      logger.trace('Note deserialized', evmNote);
      const realyedWithdraw = await activeRelayer.initWithdraw();
      logger.trace('initialized the withdraw WebSocket');
      const mixerInfo = this.inner.getMixerInfoBySize(evmNote.amount, evmNote.currency);
      logger.info(`Withdrawing to mixer info`, mixerInfo);
      const anchorContract = await this.inner.getContractByAddress(mixerInfo.address);
      logger.trace('Generating the zkp');
      const zkp = await anchorContract.generateZKP(evmNote, recipient, activeRelayer.account);
      logger.trace('Generated the zkp', zkp);
      const tx = realyedWithdraw.generateWithdrawRequest(
        {
          baseOn: 'evm',
          name: chainIdToRelayerName(evmNote.chainId),
          contractAddress: mixerInfo.address,
          endpoint: '',
        },
        zkp.proof,
        {
          fee: bufferToFixed(5000000000000000),
          nullifierHash: bufferToFixed(deposit.nullifierHash),
          recipient,
          refund: bufferToFixed(0),
          relayer: activeRelayer.account,
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
      logger.trace('Sending transaction');
      realyedWithdraw.send(tx);
    } else {
      logger.trace('Withdrawing without relayer');
      this.emit('stateChange', WithdrawState.GeneratingZk);
      const evmNote = EvmNote.deserialize(note);
      const contract = await this.inner.getContractBySize(evmNote.amount, evmNote.currency);
      try {
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
      } catch (e) {
        const reason = await this.inner.reason(e.transactionHash);

        transactionNotificationConfig.failed?.({
          address: '',
          data: reason,
          key: 'mixer-withdraw-evm',
          path: {
            method: 'withdraw',
            section: 'evm-mixer',
          },
        });
        console.log({ reason });
        console.log(e, e.__proto__);
        await 0;
        throw e;
      }
    }
  }
}
