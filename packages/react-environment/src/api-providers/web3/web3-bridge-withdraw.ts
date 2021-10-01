import { depositFromAnchor2Preimage } from '@webb-dapp/contracts/utils/make-deposit';
import { Bridge, bridgeConfig, BridgeConfig, BridgeCurrency, WithdrawState } from '@webb-dapp/react-environment';
import { WebbWeb3Provider } from '@webb-dapp/react-environment/api-providers/web3/webb-web3-provider';
import { Note } from '@webb-tools/sdk-mixer';

import { BridgeWithdraw } from '../../webb-context';
import {
  ChainId,
  chainIdIntoEVMId,
  chainsConfig,
  evmIdIntoChainId,
  getEVMChainNameFromInternal,
} from '@webb-dapp/apps/configs';
import { transactionNotificationConfig } from '@webb-dapp/wallet/providers/polkadot/transaction-notification-config';
import React from 'react';
import { LoggerService } from '@webb-tools/app-util';
import { DepositNote } from '@webb-tools/wasm-utils';
import { Web3Provider } from '@webb-dapp/wallet/providers/web3/web3-provider';

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

  async crossChainWithdraw(note: DepositNote, recipient: string) {
    // check that the active api is over the source chain
    const sourceChain = Number(note.sourceChain) as ChainId;
    const sourceChainEvm = chainIdIntoEVMId(sourceChain);
    console.log(sourceChain, sourceChainEvm);
    const activeChain = await this.inner.getChainId();
    if (activeChain !== sourceChainEvm) {
      throw new Error(`Expecting another active api for chain ${sourceChain} found ${evmIdIntoChainId(activeChain)}`);
    }
    // Temporary Provider for getting Anchors roots
    const destChainId = Number(note.chain) as ChainId;
    const destChainEvmId = chainIdIntoEVMId(destChainId);
    console.log(destChainId, destChainEvmId);
    const destChainConfig = chainsConfig[destChainId];
    const rpc = destChainConfig.url;
    const destHttpProvider = Web3Provider.fromUri(rpc);
    const destEthers = destHttpProvider.intoEthersProvider();
    const deposit = depositFromAnchor2Preimage(note.secret.replace('0x', ''), destChainEvmId);
    // Getting contracts data for source and dest chains
    const currency = BridgeCurrency.fromString(note.tokenSymbol);
    const bridge = Bridge.from(this.bridgeConfig, currency);
    const anchor = bridge.anchors.find((anchor) => anchor.amount === note.amount)!;
    const destContractAddress = anchor.anchorAddresses[destChainId]!;
    const sourceContractAddress = anchor.anchorAddresses[sourceChain]!;

    // get root and neighbour root from the dest provider
    const destAnchor = this.inner.getWebbAnchorByAddressAndProvider(destContractAddress, destEthers);
    const destLatestRoot = await destAnchor.inner.getLastRoot();
    const destLatestNeighbourRootAr = await destAnchor.inner.getLatestNeighborRoots();
    const destLatestNeighbourRoot = destLatestNeighbourRootAr[0];

    logger.trace(`destLatestNeighbourRoot ${destLatestNeighbourRoot} , destLatestRoot ${destLatestRoot}`);
    // await destHttpProvider.endSession();

    // Building the merkle proof
    const sourceContract = this.inner.getWebbAnchorByAddress(sourceContractAddress);
    const sourceRoot = await sourceContract.inner.getLastRoot();
    const known = await destAnchor.inner.isKnownNeighborRoot(4, sourceRoot);
    logger.trace(`Dest anchor knwos about the source root ? ${known}`);

    const sourceLatestRoot = await sourceContract.inner.getLastRoot();
    logger.trace(`Source latest root ${sourceLatestRoot}`);

    const isKnownRoot = await sourceContract.inner.isKnownRoot(destLatestNeighbourRoot);
    logger.trace(`isKnown root ${isKnownRoot}`);

    const merkleProof = await sourceContract.generateMerkleProofForRoot(deposit, destLatestNeighbourRoot, destAnchor);
    console.log(merkleProof);
    if (!merkleProof) {
      throw new Error('Failed to generate Merle proof');
    }

    const chid1 = await this.inner.getChainId();
    console.log({ chid1 });
    /// todo await for provider Change
    await this.inner.innerProvider.switchChain({
      chainId: `0x${destChainEvmId.toString(16)}`,
    });
    const chid = await this.inner.getChainId();
    const accounts = await this.inner.accounts.accounts();
    const account = accounts[0];

    const destContractWithSignedProvider = this.inner.getWebbAnchorByAddress(destContractAddress);
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

    const zkpResults = await destContractWithSignedProvider.merkleProofToZKP(merkleProof, deposit, input);

    await destContractWithSignedProvider.withdraw(
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
  }

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
