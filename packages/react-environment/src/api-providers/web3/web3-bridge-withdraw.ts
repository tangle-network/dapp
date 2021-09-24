import { depositFromAnchor2Preimage } from '@webb-dapp/contracts/utils/make-deposit';
import { Bridge, bridgeConfig, BridgeConfig, BridgeCurrency, WithdrawState } from '@webb-dapp/react-environment';
import { WebbWeb3Provider } from '@webb-dapp/react-environment/api-providers/web3/webb-web3-provider';
import { Note } from '@webb-tools/sdk-mixer';

import { BridgeWithdraw } from '../../webb-context';
import { ChainId, chainIdIntoEVMId, evmIdIntoChainId, getEVMChainNameFromInternal } from '@webb-dapp/apps/configs';
import { transactionNotificationConfig } from '@webb-dapp/wallet/providers/polkadot/transaction-notification-config';
import React from 'react';
import { LoggerService } from '@webb-tools/app-util';
import { DepositNote } from '@webb-tools/wasm-utils';

const logger = LoggerService.get('Web3BridgeWithdraw');

export class Web3BridgeWithdraw extends BridgeWithdraw<WebbWeb3Provider> {
  bridgeConfig: BridgeConfig = bridgeConfig;

  cancelWithdraw(): Promise<void> {
    return Promise.resolve(undefined);
  }

  async sameChainWithdraw(note: DepositNote, recipient: string) {
    // Todo Ensure the current provider is the same as the source
    const activeChain = await this.inner.getChainId();
    const internalId = evmIdIntoChainId(activeChain);
    if (Number(note.chain) !== internalId) {
      throw new Error(`The provider isn't the connected to the expected provider `);
    }
    const bridge = Bridge.from(this.bridgeConfig, BridgeCurrency.fromString(note.tokenSymbol));

    const contractAddresses = bridge.anchors.find((anchor) => anchor.amount === note.amount)!;
    const contractAddress = contractAddresses.anchorAddresses[internalId]!;

    const contract = this.inner.getWebbAnchorByAddress(contractAddress);
    const accounts = await this.inner.accounts.accounts();
    const account = accounts[0];

    const deposit = depositFromAnchor2Preimage(note.secret.replace('0x', ''), Number(activeChain));
    logger.info(`Commitment for withdraw is ${deposit.commitment}`);

    const input = {
      destinationChainId: activeChain,
      secret: deposit.secret,
      nullifier: deposit.nullifier,
      nullifierHash: deposit.nullifierHash,

      // Todo change this to the realyer address
      relayer: account.address,
      recipient: account.address,

      fee: 0,
      refund: 0,
    };

    logger.trace(`input for zkp`, input);
    this.emit('stateChange', WithdrawState.GeneratingZk);
    const zkpResults = await contract.generateZKP(deposit, input);
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
    this.emit('stateChange', WithdrawState.SendingTransaction);
    await contract.withdraw(
      zkpResults.proof,
      {
        destinationChainId: activeChain,
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
  }

  async crossChainWithdraw(note: DepositNote, recipient: string) {}

  async withdraw(note: string, recipient: string): Promise<void> {
    logger.trace(`Withdraw using note ${note} , recipient ${recipient}`);

    const parseNote = await Note.deserialize(note);
    const depositNote = parseNote.note;
    const sourceChainName = getEVMChainNameFromInternal(Number(depositNote.sourceChain) as ChainId);
    const targetChainName = getEVMChainNameFromInternal(Number(depositNote.chain) as ChainId);
    logger.trace(`Bridge withdraw from ${sourceChainName} to ${targetChainName}`);

    const token = parseNote.note.tokenSymbol;
    const bridgeCurrency = BridgeCurrency.fromString(token);
    const bridge = Bridge.from(this.bridgeConfig, bridgeCurrency);

    try {
      if (depositNote.sourceChain === depositNote.chain) {
        logger.trace(`Same chain flow ${sourceChainName}`);
        return this.sameChainWithdraw(depositNote, recipient);
      } else {
        logger.trace(`cross chain flow ${sourceChainName} ----> ${targetChainName}`);
        return this.crossChainWithdraw(depositNote, recipient);
      }
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
  }
}
