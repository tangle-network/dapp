import {
  ChainId,
  chainIdIntoEVMId,
  chainsConfig,
  evmIdIntoChainId,
  getEVMChainNameFromInternal,
} from '@webb-dapp/apps/configs';
import { MixerStorage } from '@webb-dapp/apps/configs/storages/EvmChainStorage';
import { AnchorContract } from '@webb-dapp/contracts/contracts';
import { depositFromAnchor2Preimage } from '@webb-dapp/contracts/utils/make-deposit';
import { Bridge, BridgeConfig, bridgeConfig, BridgeCurrency, WithdrawState } from '@webb-dapp/react-environment';
import { WebbWeb3Provider } from '@webb-dapp/react-environment/api-providers/web3/webb-web3-provider';
import { transactionNotificationConfig } from '@webb-dapp/wallet/providers/polkadot/transaction-notification-config';
import { Web3Provider } from '@webb-dapp/wallet/providers/web3/web3-provider';
import { LoggerService } from '@webb-tools/app-util';
import { Note } from '@webb-tools/sdk-mixer';
import { DepositNote } from '@webb-tools/wasm-utils';
import React from 'react';

import { BridgeWithdraw } from '../../webb-context';
import { anchorDeploymentBlock, bridgeCurrencyBridgeStorageFactory } from './bridge-storage';

const logger = LoggerService.get('Web3BridgeWithdraw');

export class Web3BridgeWithdraw extends BridgeWithdraw<WebbWeb3Provider> {
  bridgeConfig: BridgeConfig = bridgeConfig;

  async getRelayersByChainAndAddress(chainId: ChainId, address: string) {
    return this.inner.relayingManager.getRelayer({
      baseOn: 'evm',
      chainId: chainId,
      contractAddress: address,
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

  async getRelayersByNote(evmNote: Note) {
    return this.inner.relayingManager.getRelayer({
      baseOn: 'evm',
      chainId: Number(evmNote.note.chain),
      mixerSupport: {
        amount: Number(evmNote.note.amount),
        tokenSymbol: evmNote.note.tokenSymbol,
      },
    });
  }

  async sameChainWithdraw(note: DepositNote, recipient: string): Promise<string> {
    this.cancelToken.cancelled = false;

    const bridge = Bridge.from(this.bridgeConfig, BridgeCurrency.fromString(note.tokenSymbol));

    const activeChain = await this.inner.getChainId();
    const internalId = evmIdIntoChainId(activeChain);

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

    // Check for cancelled here, abort if it was set.
    if (this.cancelToken.cancelled) {
      transactionNotificationConfig.failed?.({
        address: recipient,
        data: 'Withdraw cancelled',
        key: 'mixer-withdraw-evm',
        path: {
          method: 'withdraw',
          section: 'evm-mixer',
        },
      });
      this.emit('stateChange', WithdrawState.Ideal);
      return '';
    }

    let txHash: string;

    this.emit('stateChange', WithdrawState.SendingTransaction);
    try {
      txHash = await contract.withdraw(
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
    } catch (e) {
      this.emit('stateChange', WithdrawState.Ideal);
      transactionNotificationConfig.failed?.({
        address: recipient,
        data: (e as any)?.code === 4001 ? 'Withdraw rejected' : 'Withdraw failed',
        key: 'bridge-withdraw-evm',
        path: {
          method: 'withdraw',
          section: `Bridge ${bridge.currency.chainIds.map(getEVMChainNameFromInternal).join('-')}`,
        },
      });
      return '';
    }

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
    return '';
  }

  async crossChainWithdraw(note: DepositNote, recipient: string) {
    this.cancelToken.cancelled = false;
    const bridgeStorageStorage = await bridgeCurrencyBridgeStorageFactory();

    // Setup a provider for the source chain
    const sourceChainId = Number(note.sourceChain) as ChainId;
    const sourceEvmId = chainIdIntoEVMId(sourceChainId);
    const sourceChainConfig = chainsConfig[sourceChainId];
    const rpc = sourceChainConfig.url;
    const sourceHttpProvider = Web3Provider.fromUri(rpc);
    const sourceEthers = sourceHttpProvider.intoEthersProvider();

    // get info from the destination chain (should be selected)
    const destChainId = Number(note.chain) as ChainId;
    const destChainEvmId = chainIdIntoEVMId(destChainId);

    // get the deposit info
    const sourceDeposit = depositFromAnchor2Preimage(note.secret.replace('0x', ''), destChainEvmId);
    this.emit('stateChange', WithdrawState.GeneratingZk);

    // Getting contracts data for source and dest chains
    const currency = BridgeCurrency.fromString(note.tokenSymbol);
    const bridge = Bridge.from(this.bridgeConfig, currency);
    const linkedAnchors = bridge.anchors.find((anchor) => anchor.amount === note.amount)!;
    const destContractAddress = linkedAnchors.anchorAddresses[destChainId]!;
    const sourceContractAddress = linkedAnchors.anchorAddresses[sourceChainId]!;

    const activeChain = await this.inner.getChainId();

    // get root and neighbour root from the dest provider
    const destAnchor = this.inner.getWebbAnchorByAddress(destContractAddress);

    // Building the merkle proof
    const sourceContract = this.inner.getWebbAnchorByAddressAndProvider(sourceContractAddress, sourceEthers);
    const sourceLatestRoot = await sourceContract.inner.getLastRoot();
    logger.trace(`Source latest root ${sourceLatestRoot}`);

    // get relayers for the source chain
    const sourceRelayers = this.inner.relayingManager.getRelayer({
      chainId: Number(note.sourceChain),
      baseOn: 'evm',
      contractAddress: sourceContractAddress,
    });

    let leaves: string[] = [];

    // loop through the sourceRelayers to fetch leaves
    for (let i = 0; i < sourceRelayers.length; i++) {
      const relayerLeaves = await sourceRelayers[i].getLeaves(sourceEvmId.toString(16), sourceContractAddress);

      const validLatestLeaf = await sourceContract.leafCreatedAtBlock(
        relayerLeaves.leaves[relayerLeaves.leaves.length - 1],
        relayerLeaves.lastQueriedBlock
      );

      console.log('validLatestLeaf: ', validLatestLeaf);

      // leaves from relayer somewhat validated, attempt to build the tree
      if (validLatestLeaf) {
        const tree = AnchorContract.createTreeWithRoot(relayerLeaves.leaves, sourceLatestRoot);

        // If we were able to build the tree, set local storage and break out of the loop
        if (tree) {
          console.log('tree valid, using relayer leaves');
          leaves = relayerLeaves.leaves;

          await bridgeStorageStorage.set(sourceContract.inner.address.toLowerCase(), {
            lastQueriedBlock: relayerLeaves.lastQueriedBlock,
            leaves: relayerLeaves.leaves,
          });
          break;
        }
      }
    }

    // if we weren't able to get leaves from the relayer, get them directly from chain
    if (!leaves.length) {
      // check if we already cached some values
      const storedContractInfo: MixerStorage[0] = (await bridgeStorageStorage.get(
        sourceContractAddress.toLowerCase()
      )) || {
        lastQueriedBlock: anchorDeploymentBlock[sourceContractAddress.toLowerCase()] || 0,
        leaves: [] as string[],
      };

      const leavesFromChain = await sourceContract.getDepositLeaves(storedContractInfo.lastQueriedBlock + 1, 0);

      leaves = [...storedContractInfo.leaves, ...leavesFromChain.newLeaves];
    }

    // generate the merkle proof
    const merkleProof = await destAnchor.generateLinkedMerkleProof(sourceDeposit, leaves);
    if (!merkleProof) {
      this.emit('stateChange', WithdrawState.Ideal);
      throw new Error('Failed to generate Merkle proof');
    }

    // Check for cancelled here, abort if it was set.
    if (this.cancelToken.cancelled) {
      transactionNotificationConfig.failed?.({
        address: recipient,
        data: 'Withdraw cancelled',
        key: 'mixer-withdraw-evm',
        path: {
          method: 'withdraw',
          section: 'evm-mixer',
        },
      });
      this.emit('stateChange', WithdrawState.Ideal);
      return '';
    }

    const accounts = await this.inner.accounts.accounts();
    const account = accounts[0];

    const input = {
      destinationChainId: activeChain,
      secret: sourceDeposit.secret,
      nullifier: sourceDeposit.nullifier,
      nullifierHash: sourceDeposit.nullifierHash,

      // Todo change this to the realyer address
      relayer: account.address,
      recipient: account.address,

      fee: 0,
      refund: 0,
    };

    let zkpResults;
    try {
      zkpResults = await destAnchor.merkleProofToZKP(merkleProof, sourceDeposit, input);
    } catch (e) {
      this.emit('stateChange', WithdrawState.Ideal);
      transactionNotificationConfig.failed?.({
        address: recipient,
        data: 'Deposit not yet available',
        key: 'mixer-withdraw-evm',
        path: {
          method: 'withdraw',
          section: 'evm-mixer',
        },
      });
      return '';
    }
    this.emit('stateChange', WithdrawState.SendingTransaction);

    let txHash: string;
    try {
      txHash = await destAnchor.withdraw(
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
    } catch (e) {
      this.emit('stateChange', WithdrawState.Ideal);
      transactionNotificationConfig.failed?.({
        address: recipient,
        data: (e as any)?.code === 4001 ? 'Withdraw rejected' : 'Withdraw failed',
        key: 'bridge-withdraw-evm',
        path: {
          method: 'withdraw',
          section: `Bridge ${bridge.currency.chainIds.map(getEVMChainNameFromInternal).join('-')}`,
        },
      });
      return '';
    }

    transactionNotificationConfig.finalize?.({
      address: recipient,
      data: undefined,
      key: 'bridge-withdraw-evm',
      path: {
        method: 'withdraw',
        section: `Bridge ${bridge.currency.chainIds.map(getEVMChainNameFromInternal).join('-')}`,
      },
    });
    this.emit('stateChange', WithdrawState.Done);
    this.emit('stateChange', WithdrawState.Ideal);
    return txHash;
  }

  async withdraw(note: string, recipient: string): Promise<string> {
    logger.trace(`Withdraw using note ${note} , recipient ${recipient}`);

    const parseNote = await Note.deserialize(note);
    const depositNote = parseNote.note;
    const sourceChainName = getEVMChainNameFromInternal(Number(depositNote.sourceChain) as ChainId);
    const targetChainName = getEVMChainNameFromInternal(Number(depositNote.chain) as ChainId);
    logger.trace(`Bridge withdraw from ${sourceChainName} to ${targetChainName}`);

    if (depositNote.sourceChain === depositNote.chain) {
      logger.trace(`Same chain flow ${sourceChainName}`);
      return this.sameChainWithdraw(depositNote, recipient);
    } else {
      logger.trace(`cross chain flow ${sourceChainName} ----> ${targetChainName}`);
      return this.crossChainWithdraw(depositNote, recipient);
    }
  }
}
