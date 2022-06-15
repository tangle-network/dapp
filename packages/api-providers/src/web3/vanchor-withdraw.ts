// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */

import type { JsUtxo } from '@webb-tools/wasm-utils';
import type { WebbWeb3Provider } from './webb-provider';

import { CircomProvingManager, CircomUtxo, Keypair, MerkleTree, Note, ProvingManagerSetupInput, Utxo } from '@webb-tools/sdk-core';
import { BigNumber, ContractReceipt, ethers } from 'ethers';

import { hexToU8a, u8aToHex } from '@polkadot/util';

import { AnchorApi, VAnchorWithdraw, WebbRelayer, WithdrawState } from '../abstracts';
import { ChainType, computeChainIdType, evmIdIntoInternalChainId, parseChainIdType } from '../chains';
import { VAnchorContract } from '../contracts';
import { utxoFromVAnchorNote } from '../contracts/utils/make-deposit';
import { Web3Provider } from '../ext-providers/web3/web3-provider';
import { fetchVariableAnchorKeyForEdges, fetchVariableAnchorWasmForEdges } from '../ipfs/evm/anchors';
import { Storage } from '../storage';
import { BridgeConfig } from '../types/bridge-config.interface';
import {
  BridgeStorage,
  bridgeStorageFactory,
  getAnchorDeploymentBlockNumber,
  getEVMChainNameFromInternal,
  keypairStorageFactory,
} from '../utils';

export class Web3VAnchorWithdraw extends VAnchorWithdraw<WebbWeb3Provider> {
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
   * @param sourceContract - A VAnchorContract wrapper for EVM chains.
   */
  async fetchLeavesFromRelayers(
    relayers: WebbRelayer[],
    sourceContract: VAnchorContract,
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

  // TODO: Implement relayer leaf fetching, relayer fee calculations
  async withdraw(notes: string[], recipient: string, amount: string): Promise<string[]> {
    console.log('attempt to withdraw: ', amount);

    this.cancelToken.cancelled = false;

    const activeBridge = this.bridgeApi.activeBridge;

    if (!activeBridge) {
      throw new Error('No activeBridge set on the web3 anchor api');
    }

    const anchorConfigsForBridge = activeBridge.anchors.find((anchor) => anchor.type === 'variable')!;

    const section = `Bridge ${Object.keys(anchorConfigsForBridge.anchorAddresses)
      .map((id) => getEVMChainNameFromInternal(this.config, Number(id)))
      .join('-')}`;
    const key = 'web3-vbridge-withdraw';
    this.inner.notificationHandler({
      description: 'Withdraw in progress',
      key,
      level: 'loading',
      message: `${section}:withdraw`,
      name: 'Transaction',
    });

    this.emit('stateChange', WithdrawState.GeneratingZk);

    // set the destination contract
    const activeChain = await this.inner.getChainId();
    const destChainIdType = computeChainIdType(ChainType.EVM, activeChain);
    const internalId = evmIdIntoInternalChainId(activeChain);
    const contractAddress = anchorConfigsForBridge.anchorAddresses[internalId]!;
    const destVAnchor = await this.inner.getVariableAnchorByAddress(contractAddress);

    // Loop through the notes and populate the leaves map
    const leavesMap: Record<string, Uint8Array[]> = {};

    // Keep track of the leafindices for each note
    const leafIndices: number[] = [];

    // calculate the sum of input notes (for calculating the change utxo)
    let sumInputNotes: BigNumber = BigNumber.from(0);

    // Create input UTXOs for convenience calculations
    let inputUTXOs: Utxo[] = [];

    for (const note of notes) {
      const parsedNote = (await Note.deserialize(note)).note;
      console.log('inside loop, parsedNote: ', parsedNote);
      sumInputNotes = ethers.utils.parseUnits(parsedNote.amount, parsedNote.denomination).add(sumInputNotes);

      // fetch leaves if we don't have them
      if (leavesMap[parsedNote.sourceChainId] === undefined) {
        // Set up a provider for the source chain
        const sourceAddress = parsedNote.sourceIdentifyingData;
        const sourceChainIdType = parseChainIdType(Number(parsedNote.sourceChainId));
        const sourceInternalId = evmIdIntoInternalChainId(sourceChainIdType.chainId);
        const sourceChainConfig = this.config.chains[sourceInternalId];
        const sourceHttpProvider = Web3Provider.fromUri(sourceChainConfig.url);
        const sourceEthers = sourceHttpProvider.intoEthersProvider();
        const sourceVAnchor = await this.inner.getVariableAnchorByAddressAndProvider(sourceAddress, sourceEthers);
        const leafStorage = await bridgeStorageFactory(Number(parsedNote.sourceChainId));

        // check if we already cached some values.
        const storedContractInfo: BridgeStorage[0] = (await leafStorage.get(sourceAddress.toLowerCase())) || {
          lastQueriedBlock: getAnchorDeploymentBlockNumber(Number(parsedNote.sourceChainId), sourceAddress) || 0,
          leaves: [] as string[],
        };

        const leavesFromChain = await sourceVAnchor.getDepositLeaves(storedContractInfo.lastQueriedBlock + 1, 0);

        console.log('populating all the leaves for chain: ', parsedNote.sourceChainId);
        leavesMap[parsedNote.sourceChainId] = [...storedContractInfo.leaves, ...leavesFromChain.newLeaves].map(
          (leaf) => {
            console.log(leaf);
            return hexToU8a(leaf);
          }
        );
      }

      let destHistorySourceRoot: string;

      // Get the latest root that has been relayed from the source chain to the destination chain
      if (parsedNote.sourceChainId === parsedNote.targetChainId) {
        const destRoot = await destVAnchor.inner.getLastRoot();
        destHistorySourceRoot = destRoot;
        console.log('destRoot: ', destRoot);
      } else {
        const edgeIndex = await destVAnchor.inner.edgeIndex(parsedNote.sourceChainId);
        const edge = await destVAnchor.inner.edgeList(edgeIndex);
        destHistorySourceRoot = edge[1];
      }

      const testMerkleTree = new MerkleTree(
        5,
        leavesMap[parsedNote.sourceChainId].map((leaf) => u8aToHex(leaf))
      );

      console.log('root of recreated merkle tree', testMerkleTree.root().toHexString());

      // Remove leaves from the leaves map which have not yet been relayed
      const provingTree = MerkleTree.createTreeWithRoot(
        5,
        leavesMap[parsedNote.sourceChainId].map((leaf) => u8aToHex(leaf)),
        destHistorySourceRoot
      );
      if (!provingTree) {
        console.log('fetched leaves do not match bridged anchor state');
        throw new Error('fetched leaves do not match bridged anchor state');
      }
      const provingLeaves = provingTree.elements().map((el) => hexToU8a(el.toHexString()));
      leavesMap[parsedNote.sourceChainId] = provingLeaves;
      const leafIndex = provingTree.getIndexByElement(u8aToHex(parsedNote.getLeafCommitment()));
      leafIndices.push(leafIndex);

      parsedNote.mutateIndex(leafIndex.toString());

      const utxo = await utxoFromVAnchorNote(parsedNote);
      inputUTXOs.push(utxo);

      console.log('utxo amount: ', utxo.amount);
    }

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

      return [];
    }

    // Retrieve the user's keypair
    const keypairStorage = await keypairStorageFactory();
    const storedPrivateKey = await keypairStorage.get('keypair');
    const keypair = new Keypair(storedPrivateKey.keypair);

    // Create the output UTXOs
    const changeAmount = sumInputNotes.sub(ethers.utils.parseEther(amount));
    const changeUtxo = await CircomUtxo.generateUtxo({
      curve: 'Bn254',
      backend: 'Circom',
      amount: changeAmount.toString(),
      chainId: destChainIdType.toString(),
      privateKey: hexToU8a(storedPrivateKey.keypair),
      keypair,
      originChainId: destChainIdType.toString(),
    });

    console.log('change utxo: ', changeUtxo.amount);

    const encChangeCommitment = keypair.encrypt(Buffer.from(changeUtxo.commitment));
    const dummyUtxo = await CircomUtxo.generateUtxo({
      curve: 'Bn254',
      backend: 'Circom',
      amount: '0',
      chainId: destChainIdType.toString(),
      keypair,
    });
    const encDummyCommitment = keypair.encrypt(Buffer.from(dummyUtxo.commitment));

    // Create the proving manager - zk fixtures are fetched depending on the contract
    // max edges as well as the number of input notes.
    let wasmBuffer: Uint8Array;
    let provingKey: Uint8Array;
    const maxEdges = await destVAnchor.inner.maxEdges();
    if (notes.length > 2) {
      provingKey = await fetchVariableAnchorKeyForEdges(maxEdges, false);
      wasmBuffer = await fetchVariableAnchorWasmForEdges(maxEdges, false);
    } else {
      provingKey = await fetchVariableAnchorKeyForEdges(maxEdges, true);
      wasmBuffer = await fetchVariableAnchorWasmForEdges(maxEdges, true);
    }

    const proofInput: ProvingManagerSetupInput<'vanchor'> = {
      chainId: destChainIdType.toString(),
      encryptedCommitments: [hexToU8a(encChangeCommitment), hexToU8a(encDummyCommitment)],
      extAmount: '0',
      fee: '0',
      indices: leafIndices,
      inputNotes: notes,
      leavesMap,
      output: [changeUtxo, dummyUtxo],
      provingKey,
      publicAmount: amount,
      recipient: hexToU8a(recipient),
      relayer: hexToU8a(recipient),
      // Roots are calculated from leavesMap in CircomProvingManager
      roots: [],
    };

    const pm = new CircomProvingManager(wasmBuffer, 5, null);
    const proof = await pm.prove('vanchor', proofInput);
    const rootsArray = await destVAnchor.getRootsForProof();

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

      return [];
    }

    this.emit('stateChange', WithdrawState.SendingTransaction);

    // Take the proof and send the transaction
    // TODO: support relayed transaction
    let receipt: ContractReceipt;

    try {
      const tx = await destVAnchor.inner.transact(
        {
          extDataHash: u8aToHex(proof.extDataHash),
          inputNullifiers: inputUTXOs.map((utxo) => utxo.nullifier),
          outputCommitments: [u8aToHex(changeUtxo.commitment), u8aToHex(dummyUtxo.commitment)],
          publicAmount: amount,
          proof: proof.proof,
          roots: `0x${rootsArray.join('')}`,
        },
        {
          extAmount: '0',
          encryptedOutput1: encChangeCommitment,
          encryptedOutput2: encDummyCommitment,
          fee: 0,
          recipient,
          relayer: recipient,
        }
      );
      receipt = await tx.wait();
    } catch (e) {
      this.emit('stateChange', WithdrawState.Ideal);

      this.inner.notificationHandler({
        description: (e as any)?.code === 4001 ? 'Withdraw rejected' : 'Withdraw failed',
        key,
        level: 'error',
        message: `${section}:withdraw`,
        name: 'Transaction',
      });

      return [];
    }

    // Parse the events for the index of the changeUTXO
    const hexCommitment = u8aToHex(changeUtxo.commitment);

    const insertedCommitmentEvent = receipt.events?.find(
      (event) => event.event === 'Insertion' && event.args?.includes(hexCommitment)
    );

    if (!insertedCommitmentEvent) {
      throw new Error("Uh oh, we didn't find our commitment in the insertions... inserted garbage");
    }

    const changeNote = proof.outputNotes.find((note) => note.getLeaf() === changeUtxo.commitment)!;

    changeNote.mutateIndex(insertedCommitmentEvent.args![1]);

    this.emit('stateChange', WithdrawState.Ideal);
    this.inner.notificationHandler({
      description: recipient,
      key,
      level: 'success',
      message: `${section}:withdraw`,
      name: 'Transaction',
    });

    return [changeNote.serialize()];
  }
}
