import { depositFromAnchor2Preimage } from '@webb-dapp/contracts/utils/make-deposit';
import { Bridge, bridgeConfig, BridgeConfig, BridgeCurrency, WithdrawState } from '@webb-dapp/react-environment';
import { WebbWeb3Provider } from '@webb-dapp/react-environment/api-providers/web3/webb-web3-provider';
import { Note } from '@webb-tools/sdk-mixer';

import { BridgeWithdraw } from '../../webb-context';
import { chainIdIntoEVMId, evmIdIntoChainId, getEVMChainNameFromInternal } from '@webb-dapp/apps/configs';
import { transactionNotificationConfig } from '@webb-dapp/wallet/providers/polkadot/transaction-notification-config';
import React from 'react';
import { LoggerService } from '@webb-tools/app-util';

const logger = LoggerService.get('Web3BridgeWithdraw');

export class Web3BridgeWithdraw extends BridgeWithdraw<WebbWeb3Provider> {
  bridgeConfig: BridgeConfig = bridgeConfig;

  cancelWithdraw(): Promise<void> {
    return Promise.resolve(undefined);
  }

  async withdraw(note: string, recipient: string): Promise<void> {
    logger.trace(`Withdraw using note ${note} , recipient ${recipient}`);
    ///--->
    const parseNote = await Note.deserialize(note);
    logger.trace(`Parsed note`, parseNote);
    this.emit('stateChange', WithdrawState.GeneratingZk);
    ///--->
    logger.info(`Commitment is from note ${parseNote.note.secret}`);
    const evmChainId = chainIdIntoEVMId(parseNote.note.chain);
    const deposit = depositFromAnchor2Preimage(parseNote.note.secret.replace('0x', ''), Number(evmChainId));
    const token = parseNote.note.tokenSymbol;
    const bridgeCurrency = BridgeCurrency.fromString(token);
    const bridge = Bridge.from(this.bridgeConfig, bridgeCurrency);
    const anchor = bridge.anchors.find((anchor) => anchor.amount == parseNote.note.amount);
    logger.trace(`Hydrated deposit from secrets`, deposit);
    logger.info(`Dest chainId ${evmChainId}  tokenSymbol ${token} , anchors`, anchor);
    try {
      transactionNotificationConfig.loading?.({
        address: recipient,
        data: React.createElement(
          'p',
          { style: { fontSize: '.9rem' } }, // Matches Typography variant=h6
          `Withdraw in progress`
        ),
        key: 'bridge-withdraw-evm',
        path: {
          method: 'withdraw',
          section: `Bridge ${bridge.currency.chainIds.map(getEVMChainNameFromInternal).join('-')}`,
        },
      });
      if (!anchor) {
        throw new Error('not Anchor for amount' + parseNote.note.chain);
      }
      const activeChainId = await this.inner.getChainId();
      const internalChainId = evmIdIntoChainId(activeChainId);
      const contractAddress = anchor.anchorAddresses[internalChainId];
      logger.trace(
        `Active chain id ${activeChainId} -> internal ChainId$ {internalChainId} === anchor contract address ${contractAddress}`
      );
      if (!contractAddress) {
        throw new Error(`No Anchor for the chain ${internalChainId}`);
      }
      const contract = this.inner.getWebbAnchorByAddress(contractAddress);
      const accounts = await this.inner.accounts.accounts();
      logger.info(`Commitment for withdraw is ${deposit.commitment}`);
      const input = {
        destinationChainId: evmChainId,
        secret: deposit.secret,
        nullifier: deposit.nullifier,
        nullifierHash: deposit.nullifierHash,

        // Todo change this to the realyer address
        relayer: accounts[0].address,
        recipient: accounts[0].address,

        fee: 0,
        refund: 0,
      };
      logger.trace(`input for zkp`, input);
      const zkpResults = await contract.generateZKP(deposit, input);
      this.emit('stateChange', WithdrawState.SendingTransaction);
      logger.trace(`Attempt to withdraw `);
      await contract.withdraw(
        zkpResults.proof,
        {
          destinationChainId: evmChainId,
          fee: input.fee,
          nullifier: input.nullifier,
          nullifierHash: input.nullifierHash,
          pathElements: zkpResults.input.pathElements,
          pathIndices: zkpResults.input.pathIndices,
          recipient: input.recipient,
          refund: input.refund,
          relayer: input.relayer,
          root: zkpResults.root as any,
          secret: zkpResults.input.secret,
        },
        zkpResults.input
      );
      this.emit('stateChange', WithdrawState.Ideal);
      transactionNotificationConfig.finalize?.({
        address: recipient,
        data: undefined,
        key: 'bridge-withdraw-evm',
        path: {
          method: 'withdraw',
          section: `Bridge ${bridge.currency.chainIds.map(getEVMChainNameFromInternal).join('-')}`,
        },
      });
    } catch (e) {
      this.emit('stateChange', WithdrawState.Ideal);
      transactionNotificationConfig.failed?.({
        address: recipient,
        data: e?.code === 40001 ? 'Withdraw rejected' : 'Withdraw failed',
        key: 'bridge-withdraw-evm',
        path: {
          method: 'withdraw',
          section: `Bridge ${bridge.currency.chainIds.map(getEVMChainNameFromInternal).join('-')}`,
        },
      });
    }
    /*
     * TODO
     * - Generate ZKP based on the bridge circuit
     * - emit events for UI
     *  - submit transaction
     * */
  }
}
