// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import {
  CircomProvingManager,
  getFixedAnchorExtDataHash,
  MerkleTree,
  Note,
  ProvingManagerSetupInput,
  toFixedHex,
} from '@webb-tools/sdk-core';

import { hexToU8a, u8aToHex } from '@polkadot/util';

import { AnchorApi, AnchorWithdraw, WebbRelayer } from '../abstracts';
import { chainTypeIdToInternalId, evmIdIntoInternalChainId, parseChainIdType } from '../chains';
import { AnchorContract, depositFromAnchorNote } from '../contracts/wrappers';
import { Web3Provider } from '../ext-providers';
import { fetchFixedAnchorKeyForEdges, fetchFixedAnchorWasmForEdges } from '../ipfs/evm/anchors';
import { Storage } from '../storage';
import {
  BridgeConfig,
  BridgeStorage,
  bridgeStorageFactory,
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

  /**
   * This routine queries the passed relayers for the leaves of an anchor instance on an evm chain.
   * It validates the leaves with on-chain data, and saves to the storage once validated.
   * An array of leaves is returned if validated, otherwise null is returned.
   * @param relayers - A list of relayers
   * @param sourceContract - An AnchorContract wrapper for EVM chains.
   */
  async fetchLeavesFromRelayers(
    relayers: WebbRelayer[],
    sourceContract: AnchorContract,
    storage: Storage<BridgeStorage>
  ): Promise<string[] | null> {
    let leaves: string[] = [];
    const sourceEvmId = await sourceContract.getEvmId();

    // loop through the sourceRelayers to fetch leaves
    for (let i = 0; i < relayers.length; i++) {
      const relayerLeaves = await relayers[i].getLeaves(sourceEvmId, sourceContract.inner.address);

      const validLatestLeaf = await sourceContract.leafCreatedAtBlock(
        relayerLeaves.leaves[relayerLeaves.leaves.length - 1],
        relayerLeaves.lastQueriedBlock
      );

      // leaves from relayer somewhat validated, attempt to build the tree
      if (validLatestLeaf) {
        // Assume the destination anchor has the same levels as source anchor
        const levels = await sourceContract.inner.levels();
        const tree = MerkleTree.createTreeWithRoot(levels, relayerLeaves.leaves, await sourceContract.getLastRoot());

        // If we were able to build the tree, set local storage and break out of the loop
        if (tree) {
          console.log('tree valid, using relayer leaves');
          leaves = relayerLeaves.leaves;

          await storage.set(sourceContract.inner.address.toLowerCase(), {
            lastQueriedBlock: relayerLeaves.lastQueriedBlock,
            leaves: relayerLeaves.leaves,
          });

          return leaves;
        }
      }
    }

    return null;
  }

  async withdraw(note: string, recipient: string): Promise<string> {
    this.cancelToken.cancelled = false;

    const activeBridge = this.bridgeApi.activeBridge;

    if (!activeBridge) {
      throw new Error('No activeBridge set on the web3 anchor api');
    }

    const parseNote = await Note.deserialize(note);
    const jsNote = parseNote.note;

    // Set up a provider for the source chain
    const sourceChainIdType = parseChainIdType(Number(jsNote.sourceChainId));
    const sourceInternalId = evmIdIntoInternalChainId(sourceChainIdType.chainId);
    const sourceChainConfig = this.config.chains[sourceInternalId];
    const sourceHttpProvider = Web3Provider.fromUri(sourceChainConfig.url);
    const sourceEthers = sourceHttpProvider.intoEthersProvider();
    const leafStorage = await bridgeStorageFactory(Number(jsNote.sourceChainId));

    // get info from the destination chain (should be selected)
    const destChainIdType = parseChainIdType(Number(jsNote.targetChainId));
    const destInternalId = chainTypeIdToInternalId(destChainIdType);

    // get the deposit info
    const sourceDeposit = depositFromAnchorNote(jsNote);

    const anchorConfigsForBridge = activeBridge.anchors.find(
      (anchor) => anchor.type === 'fixed' && anchor.amount === jsNote.amount
    )!;
    const section = `Bridge ${Object.keys(anchorConfigsForBridge.anchorAddresses)
      .map((id) => getEVMChainNameFromInternal(this.config, Number(id)))
      .join('-')}`;
    const key = 'web3-bridge-withdraw';
    this.inner.notificationHandler({
      description: 'Withdraw in progress',
      key,
      level: 'loading',
      message: `${section}:withdraw`,
      name: 'Transaction',
    });
    this.emit('stateChange', WithdrawState.GeneratingZk);

    // Getting contracts data for source and dest chains
    const bridgeCurrency = this.inner.methods.anchorApi.currency;
    const availableAnchors = await this.inner.methods.anchorApi.getAnchors();

    const selectedAnchor = availableAnchors.find((anchor) => anchor.amount === jsNote.amount);
    const destContractAddress = selectedAnchor?.neighbours[destInternalId]! as string;
    const sourceContractAddress = selectedAnchor?.neighbours[sourceInternalId]! as string;

    // Get the contract wrappers
    const destAnchor = this.inner.getFixedAnchorByAddress(destContractAddress);
    const sourceContract = this.inner.getFixedAnchorByAddressAndProvider(sourceContractAddress, sourceEthers);

    // get relayers for the source chain
    const sourceRelayers = this.inner.relayerManager.getRelayers({
      baseOn: 'evm',
      bridgeSupport: {
        amount: Number(jsNote.amount),
        tokenSymbol: jsNote.tokenSymbol,
      },
      chainId: chainTypeIdToInternalId(parseChainIdType(Number(jsNote.sourceChainId))),
    });

    let sourceLeaves = await this.fetchLeavesFromRelayers(sourceRelayers, sourceContract, leafStorage);

    // Fetch leaves from the chain if the relayers couldn't give us leaves
    if (!sourceLeaves) {
      console.log('fetching leaves from chain');

      // check if we already cached some values.
      const storedContractInfo: BridgeStorage[0] = (await leafStorage.get(sourceContractAddress.toLowerCase())) || {
        lastQueriedBlock: getAnchorDeploymentBlockNumber(Number(jsNote.sourceChainId), sourceContractAddress) || 0,
        leaves: [] as string[],
      };

      const leavesFromChain = await sourceContract.getDepositLeaves(storedContractInfo.lastQueriedBlock + 1, 0);

      sourceLeaves = [...storedContractInfo.leaves, ...leavesFromChain.newLeaves];
    }

    const destRoot = await destAnchor.inner.getLastRoot();
    let destHistorySourceRoot = destRoot;

    // If the deposit occurred on another chain than the withdrawal
    // Get the merkleRoot of the source anchor from the destAnchor's neighbor root.
    // Remove leaves after, so proofs will be made against the destAnchor's history.
    if (jsNote.sourceChainId !== jsNote.targetChainId) {
      const edgeIndex = await destAnchor.inner.edgeIndex(jsNote.sourceChainId);
      const edge = await destAnchor.inner.edgeList(edgeIndex);
      destHistorySourceRoot = edge[1];
    }

    const provingTree = MerkleTree.createTreeWithRoot(
      await sourceContract.inner.levels(),
      sourceLeaves,
      destHistorySourceRoot
    );
    if (!provingTree) {
      console.log('fetched leaves do not match bridged anchor state');
      throw new Error('fetched leaves do not match bridged anchor state');
    }
    const provingLeaves = provingTree.elements().map((el) => hexToU8a(el.toHexString()));
    const leafIndex = provingTree.getIndexByElement(sourceDeposit.commitment);

    // Fetch the zero knowledge files required for creating witnesses and verifying.
    console.log('before fetching files');
    const maxEdges = await destAnchor.inner.maxEdges();
    const wasmBuf = await fetchFixedAnchorWasmForEdges(maxEdges);
    const circuitKey = await fetchFixedAnchorKeyForEdges(maxEdges);
    console.log('after fetching files');

    // After fetching the zk files, check for cancelToken - since fetching files may take a while.
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

    const pm = new CircomProvingManager(new Uint8Array(wasmBuf), await destAnchor.inner.levels(), null);

    console.log('after creating the proving manager');

    const neighborRoots = await destAnchor.inner.getLatestNeighborRoots();

    let proofInput: ProvingManagerSetupInput<'anchor'> = {
      fee: 0,
      leaves: provingLeaves,
      leafIndex,
      note: jsNote.serialize(),
      provingKey: circuitKey,
      recipient,
      refreshCommitment: '0',
      refund: 0,
      relayer: recipient,
      roots: [destRoot, ...neighborRoots].map((root) => hexToU8a(root)),
    };

    // check for active relayer and modify proving input accordingly
    let txHash: string;
    const activeRelayer = this.inner.relayerManager.activeRelayer;

    if (activeRelayer && activeRelayer.beneficiary) {
      proofInput.fee = Number((await activeRelayer.fees(jsNote.serialize()))?.totalFees);
      proofInput.relayer = activeRelayer.beneficiary;
    }

    console.log('before getting fixed anchor extDataHash');
    const extDataHash = getFixedAnchorExtDataHash(
      proofInput.fee,
      proofInput.recipient,
      proofInput.refreshCommitment,
      proofInput.refund,
      proofInput.relayer
    );
    console.log('before using proving manager to prove');

    const proof = await pm.prove('anchor', proofInput);

    console.log('after making the proof: ', proof);

    // Check for cancelled after generating proof, as this takes a while.
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

    // If the active relayer is selected, do a relayed withdraw
    if (activeRelayer && activeRelayer.beneficiary) {
      this.emit('stateChange', WithdrawState.SendingTransaction);
      const relayedWithdraw = await activeRelayer.initWithdraw('anchor');

      const chainInfo = {
        baseOn: 'evm' as RelayerCMDBase,
        contractAddress: destContractAddress,
        endpoint: '',
        name: chainIdToRelayerName(destInternalId),
      };

      const tx = relayedWithdraw.generateWithdrawRequest<typeof chainInfo, 'anchor'>(chainInfo, proof.proof, {
        chain: chainInfo.name,
        extDataHash: extDataHash.toHexString(),
        fee: toFixedHex(proofInput.fee),
        id: chainInfo.contractAddress,
        nullifierHash: toFixedHex(proof.nullifierHash),
        recipient: proofInput.recipient,
        refreshCommitment: proofInput.refreshCommitment,
        refund: toFixedHex(proofInput.refund),
        relayer: proofInput.relayer,
        // combine the roots to one big string
        roots: `0x${proofInput.roots.map((root) => u8aToHex(root).slice(2)).join('')}`,
      });

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
        this.emit('stateChange', WithdrawState.SendingTransaction);

        console.log('before making the call to withdraw');

        // Withdraw directly
        const tx = await destAnchor.inner.withdraw(
          {
            proof: proof.proof,
            // combine the roots to one big string
            _roots: `0x${proofInput.roots.map((root) => u8aToHex(root).slice(2)).join('')}`,
            _extDataHash: extDataHash.toHexString(),
            _nullifierHash: proof.nullifierHash,
          },
          {
            _refreshCommitment: toFixedHex(proofInput.refreshCommitment),
            _recipient: proofInput.recipient,
            _relayer: proofInput.relayer,
            _refund: toFixedHex(proofInput.refund),
            _fee: toFixedHex(proofInput.fee),
          }
        );
        const receipt = await tx.wait();

        txHash = receipt.transactionHash;
      } catch (e) {
        this.emit('stateChange', WithdrawState.Ideal);
        console.log(e);

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
}
