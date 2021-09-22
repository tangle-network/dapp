import { depositFromAnchor2Preimage } from '@webb-dapp/contracts/utils/make-deposit';
import { Bridge, bridgeConfig, BridgeConfig, BridgeCurrency, WithdrawState } from '@webb-dapp/react-environment';
import { WebbWeb3Provider } from '@webb-dapp/react-environment/api-providers/web3/webb-web3-provider';
import { Note } from '@webb-tools/sdk-mixer';

import { BridgeWithdraw } from '../../webb-context';
import { ChainId, chainIdIntoEVMId, getEVMChainNameFromInternal } from '@webb-dapp/apps/configs';
import { logger } from 'ethers';
import { transactionNotificationConfig } from '@webb-dapp/wallet/providers/polkadot/transaction-notification-config';
import React from 'react';

export class Web3BridgeWithdraw extends BridgeWithdraw<WebbWeb3Provider> {
  bridgeConfig: BridgeConfig = bridgeConfig;

  cancelWithdraw(): Promise<void> {
    return Promise.resolve(undefined);
  }

  async withdraw(note: string, recipient: string): Promise<void> {
    ///--->
    const parseNote = await Note.deserialize(note);

    this.emit('stateChange', WithdrawState.GeneratingZk);
    ///--->
    logger.info(`Commitment is from note ${parseNote.note.secret}`);
    const evmChainId = chainIdIntoEVMId(parseNote.note.chain);
    const deposit = depositFromAnchor2Preimage(parseNote.note.secret.replace('0x', ''), Number(evmChainId));
    const token = parseNote.note.tokenSymbol;
    const bridgeCurrency = BridgeCurrency.fromString(token);
    const bridge = Bridge.from(this.bridgeConfig, bridgeCurrency);
    const anchor = bridge.anchors.find((anchor) => anchor.amount == parseNote.note.amount);

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
      const contractAddress = anchor.anchorAddresses[Number(parseNote.note.chain) as ChainId];
      if (!contractAddress) {
        throw new Error(`No Anchor for the chain ${parseNote.note.chain}`);
      }
      const contract = this.inner.getWebbAnchorByAddress(contractAddress);
      const accounts = await this.inner.accounts.accounts();
      logger.info(`Commitment for withdraw is ${deposit.commitment}`);
      const input = {
        destinationChainId: Number(parseNote.note.chain),
        fee: 0,
        nullifier: deposit.nullifier,
        recipient: accounts[0].address,
        nullifierHash: deposit.nullifierHash,
        refund: 0,
        relayer: accounts[0].address,
        secret: deposit.secret,
      };
      const zkpResults = await contract.generateZKP(deposit, input);
      this.emit('stateChange', WithdrawState.SendingTransaction);
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
      console.log(e);
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
