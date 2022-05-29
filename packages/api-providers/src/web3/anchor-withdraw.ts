// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */

import { Anchor } from '@webb-tools/anchors';
import { MerkleTree } from '@webb-tools/merkle-tree';
import { Note } from '@webb-tools/sdk-core';
import { toFixedHex } from '@webb-tools/utils';
import { JsNote as DepositNote } from '@webb-tools/wasm-utils';

import { AnchorApi, AnchorWithdraw } from '../abstracts';
import {
  ChainType,
  chainTypeIdToInternalId,
  computeChainIdType,
  evmIdIntoInternalChainId,
  parseChainIdType,
} from '../chains';
import { depositFromAnchorNote } from '../contracts/utils/make-deposit';
import { Web3Provider } from '../ext-providers';
import { fetchFixedAnchorKeyForEdges, fetchFixedAnchorWasmForEdges } from '../ipfs/evm/anchors';
import {
  BridgeConfig,
  BridgeStorage,
  bridgeStorageFactory,
  buildFixedWitness,
  chainIdToRelayerName,
  getAnchorDeploymentBlockNumber,
  getEVMChainNameFromInternal,
  RelayedWithdrawResult,
  RelayerCMDBase,
  WithdrawState,
} from '../';
import { WebbWeb3Provider } from './webb-provider';

export class Web3AnchorWithdraw extends AnchorWithdraw<WebbWeb3Provider> {
  protected get bridgeApi() {
    return this.inner.methods.anchorApi as AnchorApi<WebbWeb3Provider, BridgeConfig>;
  }

  protected get config() {
    return this.inner.config;
  }

  // Same chain ('mixer') withdraw flow.
  // 1. Fetch all of the leaves (stored and new from relayer / inner provider querying)
  // 2. Connect and update a new protocol-solidity Anchor instance with all of the leaves.
  //
  // If relayer is selected:
  //    Use Anchor instance methods to generate proof and initiate relayed withdraw flow.
  // If no relayer is selected:
  //    Use Anchor instance 'withdraw' method.
  async sameChainWithdraw(note: DepositNote, recipient: string): Promise<string> {
    this.cancelToken.cancelled = false;

    const activeBridge = this.bridgeApi.activeBridge;

    if (!activeBridge) {
      throw new Error('No activeBridge set on the web3 anchor api');
    }

    // Parse the intended target address for the note
    const activeChain = await this.inner.getChainId();
    const internalId = evmIdIntoInternalChainId(activeChain);

    const anchorConfigsForBridge = activeBridge.anchors.find(
      (anchor) => anchor.type === 'fixed' && anchor.amount === note.amount
    )!;
    const contractAddress = anchorConfigsForBridge.anchorAddresses[internalId]!;

    // create the Anchor instance
    const contract = this.inner.getFixedAnchorByAddress(contractAddress);

    // Fetch the leaves that we already have in storage
    const bridgeStorageStorage = await bridgeStorageFactory(Number(note.sourceChainId));
    const storedContractInfo: BridgeStorage[0] = (await bridgeStorageStorage.get(contractAddress.toLowerCase())) || {
      lastQueriedBlock:
        getAnchorDeploymentBlockNumber(computeChainIdType(ChainType.EVM, activeChain), contractAddress) || 0,
      leaves: [] as string[],
    };

    let allLeaves: string[] = [];

    // Fetch the new leaves - from a relayer or from the chain directly.
    // TODO: Fetch the leaves from the relayer
    // eslint-disable-next-line no-constant-condition
    if (/* this.activeRelayer */ false) {
      // fetch the new leaves (all leaves) from the relayer
    } else {
      // fetch the new leaves from on-chain
      const depositLeaves = await contract.getDepositLeaves(
        storedContractInfo.lastQueriedBlock,
        await this.inner.getBlockNumber()
      );

      allLeaves = [...storedContractInfo.leaves, ...depositLeaves.newLeaves];
    }

    // Fetch the information for public inputs into the proof
    const accounts = await this.inner.accounts.accounts();
    const account = accounts[0];

    // Fetch the information for private inputs into the proof
    const deposit = depositFromAnchorNote(note);
    const leafIndex = allLeaves.findIndex((commitment) => commitment === deposit.commitment);

    // Fetch the zero knowledge files required for creating witnesses and verifying.
    const maxEdges = await contract.inner.maxEdges();
    const wasmBuf = await fetchFixedAnchorWasmForEdges(maxEdges);

    const witnessCalculator = await buildFixedWitness(wasmBuf, {});
    const circuitKey = await fetchFixedAnchorKeyForEdges(maxEdges);

    // This anchor wrapper from protocol-solidity is used for public inputs generation
    const anchorWrapper = await Anchor.connect(
      contractAddress,
      {
        wasm: Buffer.from(wasmBuf),
        witnessCalculator,
        zkey: circuitKey,
      },
      this.inner.getEthersProvider().getSigner()
    );

    // Give the anchor wrapper the fetched leaves
    const successfulSet = await anchorWrapper.setWithLeaves(allLeaves);

    console.log('After attempting to set the leaves on achor wrapper: ', successfulSet);

    const section = `Bridge ${Object.keys(anchorConfigsForBridge.anchorAddresses)
      .map((id) => getEVMChainNameFromInternal(this.config, Number(id)))
      .join('-')}`;
    const key = 'web3-bridge-withdraw';

    // Check for cancelled here, abort if it was set.
    if (this.cancelToken.cancelled) {
      this.inner.notificationHandler({
        description: 'Withdraw canceled',
        key,
        level: 'error',
        message: `${section}:withdraw`,
        name: 'Transaction',
      });
      this.emit('stateChange', WithdrawState.Ideal);

      return '';
    }

    this.emit('stateChange', WithdrawState.GeneratingZk);
    const withdrawSetup = await anchorWrapper.setupWithdraw(
      deposit,
      leafIndex,
      account.address,
      account.address,
      BigInt(0),
      0
    );
    let txHash = '';

    this.emit('stateChange', WithdrawState.SendingTransaction);

    this.inner.notificationHandler({
      description: 'Withdraw in progress',
      key,
      level: 'loading',
      message: `${section}:withdraw`,
      name: 'Transaction',
    });

    try {
      const tx = await anchorWrapper.contract.withdraw(withdrawSetup.publicInputs, withdrawSetup.extData, {
        gasLimit: '0x5B8D80',
      });
      const receipt = await tx.wait();

      txHash = receipt.transactionHash;
    } catch (e) {
      this.emit('stateChange', WithdrawState.Ideal);

      this.inner.notificationHandler({
        description: (e as any)?.code === 4001 ? 'Withdraw rejected' : 'Withdraw failed',
        key,
        level: 'error',
        message: `${section}:withdraw`,
        name: 'Transaction',
      });

      return txHash;
    }

    this.emit('stateChange', WithdrawState.Ideal);
    this.inner.notificationHandler({
      description: recipient,
      key,
      level: 'success',
      message: `${section}:withdraw`,
      name: 'Transaction',
    });

    return txHash;
  }

  async crossChainWithdraw(note: DepositNote, recipient: string) {
    this.cancelToken.cancelled = false;
    const activeBridge = this.bridgeApi.activeBridge;

    if (!activeBridge) {
      throw new Error('No activeBridge set on the web3 anchor api');
    }

    // TODO: handle provider storage
    // const bridgeStorageStorage = await bridgeCurrencyBridgeStorageFactory();

    // Set up a provider for the source chain
    const sourceChainIdType = parseChainIdType(Number(note.sourceChainId));
    const sourceEvmId = sourceChainIdType.chainId;
    const sourceInternalId = evmIdIntoInternalChainId(sourceEvmId);
    const sourceChainConfig = this.config.chains[sourceInternalId];
    const rpc = sourceChainConfig.url;
    const sourceHttpProvider = Web3Provider.fromUri(rpc);
    const sourceEthers = sourceHttpProvider.intoEthersProvider();
    const sourceBridgeStorage = await bridgeStorageFactory(Number(note.sourceChainId));

    // get info from the destination chain (should be selected)
    const destChainIdType = parseChainIdType(Number(note.targetChainId));
    const destInternalId = chainTypeIdToInternalId(destChainIdType);

    // get the deposit info
    const sourceDeposit = depositFromAnchorNote(note);

    this.emit('stateChange', WithdrawState.GeneratingZk);

    // Getting contracts data for source and dest chains
    const bridgeCurrency = this.inner.methods.anchorApi.currency;
    // await this.inner.methods.bridgeApi.setActiveBridge()
    const availableAnchors = await this.inner.methods.anchorApi.getAnchors();

    const selectedAnchor = availableAnchors.find((anchor) => anchor.amount === note.amount);
    const destContractAddress = selectedAnchor?.neighbours[destInternalId]! as string;
    const sourceContractAddress = selectedAnchor?.neighbours[sourceInternalId]! as string;

    // get root and neighbour root from the dest provider
    const destAnchor = this.inner.getFixedAnchorByAddress(destContractAddress);

    // Building the merkle proof
    const sourceContract = this.inner.getFixedAnchorByAddressAndProvider(sourceContractAddress, sourceEthers);
    const sourceLatestRoot = await sourceContract.inner.getLastRoot();

    // get relayers for the source chain
    const sourceRelayers = this.inner.relayerManager.getRelayers({
      baseOn: 'evm',
      bridgeSupport: {
        amount: Number(note.amount),
        tokenSymbol: note.tokenSymbol,
      },
      chainId: chainTypeIdToInternalId(parseChainIdType(Number(note.sourceChainId))),
    });

    let leaves: string[] = [];

    // loop through the sourceRelayers to fetch leaves
    for (let i = 0; i < sourceRelayers.length; i++) {
      const relayerLeaves = await sourceRelayers[i].getLeaves(sourceEvmId, sourceContractAddress);

      const validLatestLeaf = await sourceContract.leafCreatedAtBlock(
        relayerLeaves.leaves[relayerLeaves.leaves.length - 1],
        relayerLeaves.lastQueriedBlock
      );

      // leaves from relayer somewhat validated, attempt to build the tree
      if (validLatestLeaf) {
        // Assume the destination anchor has the same levels as source anchor
        const levels = await destAnchor.inner.levels();
        const tree = MerkleTree.createTreeWithRoot(levels, relayerLeaves.leaves, sourceLatestRoot);

        // If we were able to build the tree, set local storage and break out of the loop
        if (tree) {
          console.log('tree valid, using relayer leaves');
          leaves = relayerLeaves.leaves;

          await sourceBridgeStorage.set(sourceContract.inner.address.toLowerCase(), {
            lastQueriedBlock: relayerLeaves.lastQueriedBlock,
            leaves: relayerLeaves.leaves,
          });
          break;
        }
      }
    }

    // if we weren't able to get leaves from the relayer, get them directly from chain
    if (!leaves.length) {
      console.log('fetching leaves from chain');

      // check if we already cached some values.
      const storedContractInfo: BridgeStorage[0] = (await sourceBridgeStorage.get(
        sourceContractAddress.toLowerCase()
      )) || {
        lastQueriedBlock: getAnchorDeploymentBlockNumber(Number(note.sourceChainId), sourceContractAddress) || 0,
        leaves: [] as string[],
      };

      const leavesFromChain = await sourceContract.getDepositLeaves(storedContractInfo.lastQueriedBlock + 1, 0);

      leaves = [...storedContractInfo.leaves, ...leavesFromChain.newLeaves];
    }

    // Fetch the information for public inputs into the proof
    const accounts = await this.inner.accounts.accounts();
    const account = accounts[0];

    // generate the merkle proof. Called on the destAnchor because the proof should be made against
    // the destination anchor's neighbor root (sourceAnchor root) to prevent race conditions
    const linkedMerkleProof = await destAnchor.generateLinkedMerkleProof(sourceDeposit, leaves, sourceEvmId);

    if (!linkedMerkleProof) {
      this.emit('stateChange', WithdrawState.Ideal);
      throw new Error('Failed to generate Merkle proof');
    }

    // Fetch the zero knowledge files required for creating witnesses and verifying.
    const maxEdges = await destAnchor.inner.maxEdges();
    const wasmBuf = await fetchFixedAnchorWasmForEdges(maxEdges);
    const witnessCalculator = await buildFixedWitness(wasmBuf, {});
    const circuitKey = await fetchFixedAnchorKeyForEdges(maxEdges);

    // This anchor wrapper from protocol-solidity is used for public inputs generation
    const anchorWrapper = await Anchor.connect(
      destAnchor.inner.address,
      {
        wasm: Buffer.from(wasmBuf),
        witnessCalculator,
        zkey: circuitKey,
      },
      this.inner.getEthersProvider().getSigner()
    );

    // Check for cancelled here, abort if it was set.
    if (this.cancelToken.cancelled) {
      this.inner.notificationHandler({
        description: 'Withdraw cancelled',
        key: 'mixer-withdraw-evm',
        level: 'error',
        message: 'bridge:withdraw',
        name: 'Transaction',
      });
      this.emit('stateChange', WithdrawState.Ideal);

      return '';
    }

    const merkleProof = linkedMerkleProof.path;

    let txHash: string;
    const activeRelayer = this.inner.relayerManager.activeRelayer;

    if (activeRelayer && activeRelayer !== null && activeRelayer.beneficiary) {
      console.log('withdrawing through relayer');

      // setup the cross chain withdraw with the generated merkle proof
      this.emit('stateChange', WithdrawState.GeneratingZk);
      const withdrawSetup = await anchorWrapper.setupBridgedWithdraw(
        sourceDeposit,
        merkleProof,
        recipient,
        activeRelayer.beneficiary,
        BigInt(0),
        0
      );

      this.emit('stateChange', WithdrawState.SendingTransaction);
      const relayedWithdraw = await activeRelayer.initWithdraw('anchor');

      const chainInfo = {
        baseOn: 'evm' as RelayerCMDBase,
        contractAddress: destContractAddress,
        endpoint: '',
        name: chainIdToRelayerName(destInternalId),
      };

      const tx = relayedWithdraw.generateWithdrawRequest<typeof chainInfo, 'anchor'>(
        chainInfo,
        withdrawSetup.publicInputs.proof,
        {
          chain: chainInfo.name,
          extDataHash: withdrawSetup.publicInputs._extDataHash,
          fee: toFixedHex(withdrawSetup.extData._fee),
          id: chainInfo.contractAddress,
          nullifierHash: toFixedHex(withdrawSetup.publicInputs._nullifierHash),
          recipient: withdrawSetup.extData._recipient,
          refreshCommitment: withdrawSetup.extData._refreshCommitment,
          refund: toFixedHex(withdrawSetup.extData._refund),
          relayer: withdrawSetup.extData._relayer,
          roots: withdrawSetup.publicInputs._roots,
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

            this.inner.notificationHandler({
              description: 'Withdraw success',
              key: 'mixer-withdraw-evm',
              level: 'success',
              message: 'bridge:withdraw',
              name: 'Transaction',
            });

            break;
          case RelayedWithdrawResult.Errored:
            this.emit('stateChange', WithdrawState.Failed);
            this.emit('stateChange', WithdrawState.Ideal);

            this.inner.notificationHandler({
              description: message || 'Withdraw failed',
              key: 'mixer-withdraw-evm',
              level: 'error',
              message: 'bridge:withdraw',
              name: 'Transaction',
            });

            break;
        }
      });
      // stringify the request
      const data = JSON.stringify(tx);

      console.log(data);

      relayedWithdraw.send(tx);
      const txResult = await relayedWithdraw.await();

      if (!txResult || !txResult?.[1]) {
        return '';
      }

      txHash = txResult?.[1] || '';
    } else {
      try {
        // setup the cross chain withdraw with the generated merkle proof
        this.emit('stateChange', WithdrawState.GeneratingZk);
        const withdrawSetup = await anchorWrapper.setupBridgedWithdraw(
          sourceDeposit,
          merkleProof,
          recipient,
          account.address,
          BigInt(0),
          0
        );

        this.emit('stateChange', WithdrawState.SendingTransaction);
        console.log(withdrawSetup);

        const tx = await destAnchor.inner.withdraw(withdrawSetup.publicInputs, withdrawSetup.extData);
        const receipt = await tx.wait();

        txHash = receipt.transactionHash;
      } catch (e) {
        this.emit('stateChange', WithdrawState.Ideal);
        this.inner.notificationHandler({
          description: (e as any)?.code === 4001 ? 'Withdraw rejected' : 'Withdraw failed',
          key: 'bridge-withdraw-evm',
          level: 'error',
          message: `Bridge ${bridgeCurrency
            ?.getChainIds()
            .map((id) => getEVMChainNameFromInternal(this.config, id))
            .join('-')}:withdraw`,
          name: 'Transaction',
        });

        return '';
      }
    }

    this.inner.notificationHandler({
      description: 'Withdraw done',
      key: 'bridge-withdraw-evm',
      level: 'success',
      message: `Bridge ${bridgeCurrency
        ?.getChainIds()
        .map((id) => getEVMChainNameFromInternal(this.config, id))
        .join('-')}:withdraw`,
      name: 'Transaction',
    });

    this.emit('stateChange', WithdrawState.Done);
    this.emit('stateChange', WithdrawState.Ideal);

    return txHash;
  }

  // withdraw determines if the withdraw flow should be cross-chain or the same chain.
  // The merkle proof is always generated from the source anchor, therefore, a new provider
  // needs to be constructed in the cross-chain scenario.
  // Zero knowledge files are fetched in both withdraw flows.
  async withdraw(note: string, recipient: string): Promise<string> {
    const parseNote = await Note.deserialize(note);
    const depositNote = parseNote.note;

    if (depositNote.sourceChainId === depositNote.targetChainId) {
      return this.sameChainWithdraw(depositNote, recipient);
    } else {
      return this.crossChainWithdraw(depositNote, recipient);
    }
  }
}
