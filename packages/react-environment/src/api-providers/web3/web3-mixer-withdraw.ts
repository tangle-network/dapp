import { evmIdIntoChainId } from '@webb-dapp/apps/configs';
import { chainIdToRelayerName } from '@webb-dapp/apps/configs/relayer-config';
import { bufferToFixed } from '@webb-dapp/contracts/utils/buffer-to-fixed';
import { depositFromPreimage } from '@webb-dapp/contracts/utils/make-deposit';
import { fromDepositIntoZKPInput } from '@webb-dapp/contracts/utils/zkp-adapters';
import { WebbWeb3Provider } from '@webb-dapp/react-environment/api-providers/web3/webb-web3-provider';
import {
  MixerWithdraw,
  OptionalActiveRelayer,
  OptionalRelayer,
  WithdrawState,
} from '@webb-dapp/react-environment/webb-context';
import { RelayedWithdrawResult, WebbRelayer } from '@webb-dapp/react-environment/webb-context/relayer';
import { WebbError } from '@webb-dapp/utils/webb-error';
import { transactionNotificationConfig } from '@webb-dapp/wallet/providers/polkadot/transaction-notification-config';
import { LoggerService } from '@webb-tools/app-util';
import { Note } from '@webb-tools/sdk-mixer';
import { BigNumber } from 'ethers';
import React from 'react';

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
    return WebbRelayer.intoActiveWebRelayer(
      relayer,
      {
        basedOn: 'evm',
        chain: chainId,
      },
      async (note: string, withdrawFeePercentage: number) => {
        try {
          const depositNote = await Note.deserialize(note);
          const evmNote = depositNote.note;

          const contract = await this.inner.getContractBySize(evmNote.amount, evmNote.tokenSymbol);
          const principleBig = await contract.denomination;

          const withdrawFeeMill = withdrawFeePercentage * 1000000;

          const withdrawFeeMillBig = BigNumber.from(withdrawFeeMill);
          const feeBigMill = principleBig.mul(withdrawFeeMillBig);

          const feeBig = feeBigMill.div(BigNumber.from(1000000));
          return feeBig.toString();
        } catch (e) {
          if (e instanceof WebbError) {
            return '';
          }
          throw e;
        }
      }
    );
  }

  get relayers() {
    return this.inner.getChainId().then((evmId) => {
      const chainId = evmIdIntoChainId(evmId);
      const relayers = this.inner.relayingManager.getRelayer({});
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
    const evmNote = await Note.deserialize(note);
    const deposit = depositFromPreimage(evmNote.note.secret.replace('0x', ''));
    if (activeRelayer && activeRelayer.account) {
      this.emit('stateChange', WithdrawState.GeneratingZk);

      transactionNotificationConfig.loading?.({
        address: recipient,
        data: React.createElement(
          'p',
          { style: { fontSize: '.9rem' } }, // Matches Typography variant=h6
          `Relaying withdraw through ${activeRelayer.address}`
        ),
        key: 'mixer-withdraw-evm',
        path: {
          method: 'withdraw',
          section: 'evm-mixer',
        },
      });
      logger.info(`Withdrawing through relayer with address ${activeRelayer.address}`);
      logger.trace('Note deserialized', evmNote);
      const relayedWithdraw = await activeRelayer.initWithdraw();
      logger.trace('initialized the withdraw WebSocket');
      const mixerInfo = this.inner.getMixerInfoBySize(evmNote.amount, evmNote.currency);
      logger.info(`Withdrawing to mixer info`, mixerInfo);
      const anchorContract = await this.inner.getContractByAddress(mixerInfo.address);
      logger.trace('Generating the zkp');
      const fees = await activeRelayer.fees(note);
      const zkpInputWithoutMerkleProof = fromDepositIntoZKPInput(deposit, {
        recipient,
        relayer: activeRelayer.account,
        fee: Number(fees),
      });
      const zkp = await anchorContract.generateZKP(deposit, zkpInputWithoutMerkleProof);
      this.emit('stateChange', WithdrawState.GeneratingZk);

      logger.trace('Generated the zkp', zkp);
      const tx = relayedWithdraw.generateWithdrawRequest(
        {
          baseOn: 'evm',
          name: chainIdToRelayerName(evmNote.chainId),
          contractAddress: mixerInfo.address,
          endpoint: '',
        },
        zkp.proof,
        {
          fee: bufferToFixed(zkpInputWithoutMerkleProof.fee),
          nullifierHash: bufferToFixed(deposit.nullifierHash),
          recipient: zkpInputWithoutMerkleProof.recipient,
          refund: bufferToFixed(zkpInputWithoutMerkleProof.refund),
          relayer: zkpInputWithoutMerkleProof.relayer,
          root: bufferToFixed(zkp.input.root),
        }
      );
      relayedWithdraw.watcher.subscribe(([nextValue, message]) => {
        switch (nextValue) {
          case RelayedWithdrawResult.PreFlight:
          case RelayedWithdrawResult.OnFlight:
            this.emit('stateChange', WithdrawState.SendingTransaction);
            break;
          case RelayedWithdrawResult.Continue:
            break;
          case RelayedWithdrawResult.CleanExit:
            this.emit('stateChange', WithdrawState.Done);
            this.emit('stateChange', WithdrawState.Ideal);
            transactionNotificationConfig.finalize?.({
              address: recipient,
              data: undefined,
              key: 'mixer-withdraw-evm',
              path: {
                method: 'withdraw',
                section: 'evm-mixer',
              },
            });
            break;
          case RelayedWithdrawResult.Errored:
            this.emit('stateChange', WithdrawState.Failed);
            this.emit('stateChange', WithdrawState.Ideal);
            transactionNotificationConfig.failed?.({
              address: recipient,
              data: message || 'Withdraw failed',
              key: 'mixer-withdraw-evm',
              path: {
                method: 'withdraw',
                section: 'evm-mixer',
              },
            });
            break;
        }
      });
      logger.trace('Sending transaction');
      relayedWithdraw.send(tx);
      await relayedWithdraw.await();
    } else {
      logger.trace('Withdrawing without relayer');
      this.emit('stateChange', WithdrawState.GeneratingZk);
      const contract = await this.inner.getContractBySize(evmNote.note.amount, evmNote.note.tokenSymbol);
      try {
        const zkpInputWithoutMerkleProof = fromDepositIntoZKPInput(deposit, {
          recipient,
          relayer: recipient,
        });
        const txReset = await contract.withdraw(deposit, zkpInputWithoutMerkleProof);
        transactionNotificationConfig.loading?.({
          address: recipient,
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
          address: recipient,
          data: undefined,
          key: 'mixer-withdraw-evm',
          path: {
            method: 'withdraw',
            section: 'evm-mixer',
          },
        });
        this.emit('stateChange', WithdrawState.Ideal);
      } catch (e) {
        // todo fix this and fetch the error from chain
        // const reason = await this.inner.reason(e.transactionHash);

        transactionNotificationConfig.failed?.({
          address: recipient,
          data: 'Withdraw failed',
          key: 'mixer-withdraw-evm',
          path: {
            method: 'withdraw',
            section: 'evm-mixer',
          },
        });
        throw e;
      }
    }
  }
}
