// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */

import type { WebbWeb3Provider } from './webb-provider';

import {
  CircomProvingManager,
  CircomUtxo,
  FIELD_SIZE,
  Keypair,
  MerkleTree,
  Note,
  ProvingManagerSetupInput,
  randomBN,
  toFixedHex,
  Utxo,
} from '@webb-tools/sdk-core';
import { BigNumber, BigNumberish, ContractReceipt, ethers } from 'ethers';

import { hexToU8a, u8aToHex } from '@polkadot/util';

import { AnchorApi, VAnchorWithdraw, WebbRelayer, WithdrawState } from '../abstracts';
import { ChainType, computeChainIdType, evmIdIntoInternalChainId, parseChainIdType } from '../chains';
import { VAnchorContract } from '../contracts';
import { generateCircomCommitment, utxoFromVAnchorNote } from '../contracts/utils/make-deposit';
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
    const destAddress = anchorConfigsForBridge.anchorAddresses[internalId]!;
    const destVAnchor = await this.inner.getVariableAnchorByAddress(destAddress);
    const treeHeight = await destVAnchor._contract.levels();

    // Loop through the notes and populate the leaves map
    const leavesMap: Record<string, Uint8Array[]> = {};

    // Keep track of the leafindices for each note
    const leafIndices: number[] = [];

    // calculate the sum of input notes (for calculating the change utxo)
    let sumInputNotes: BigNumber = BigNumber.from(0);

    // Create input UTXOs for convenience calculations
    let inputUtxos: Utxo[] = [];

    console.log('before note loop');

    for (const note of notes) {
      console.log(note);
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

      leavesMap[parsedNote.sourceChainId].map((leaf) => console.log(u8aToHex(leaf)));

      const testMerkleTree = new MerkleTree(
        treeHeight,
        leavesMap[parsedNote.sourceChainId].map((leaf) => u8aToHex(leaf))
      );

      console.log('root of recreated merkle tree', testMerkleTree.root().toHexString());

      // Remove leaves from the leaves map which have not yet been relayed
      const provingTree = MerkleTree.createTreeWithRoot(
        treeHeight,
        leavesMap[parsedNote.sourceChainId].map((leaf) => u8aToHex(leaf)),
        destHistorySourceRoot
      );
      if (!provingTree) {
        console.log('fetched leaves do not match bridged anchor state');
        throw new Error('fetched leaves do not match bridged anchor state');
      }
      provingTree.elements().map((el) => console.log(el));
      const provingLeaves = provingTree.elements().map((el) => hexToU8a(el.toHexString()));
      leavesMap[parsedNote.sourceChainId] = provingLeaves;
      const commitment = generateCircomCommitment(parsedNote);
      const leafIndex = provingTree.getIndexByElement(commitment);
      console.log('createdCommitment from note: ', commitment);
      console.log('leafIndex in proving tree: ', leafIndex);
      leafIndices.push(leafIndex);

      const utxo = await utxoFromVAnchorNote(parsedNote, leafIndex);
      inputUtxos.push(utxo);
    }

    const randomKeypair = new Keypair();

    // Add default input notes if required
    while (inputUtxos.length !== 2 && inputUtxos.length < 16) {
      inputUtxos.push(
        await CircomUtxo.generateUtxo({
          curve: 'Bn254',
          backend: 'Circom',
          chainId: destChainIdType.toString(),
          originChainId: destChainIdType.toString(),
          amount: '0',
          blinding: hexToU8a(randomBN(31).toHexString()),
          keypair: randomKeypair,
        })
      );
    }

    // Populate the leaves if not already populated.
    if (!leavesMap[destChainIdType.toString()]) {
      const leafStorage = await bridgeStorageFactory(destChainIdType);

      // check if we already cached some values.
      const storedContractInfo: BridgeStorage[0] = (await leafStorage.get(destAddress.toLowerCase())) || {
        lastQueriedBlock: getAnchorDeploymentBlockNumber(destChainIdType, destAddress) || 0,
        leaves: [] as string[],
      };

      const leavesFromChain = await destVAnchor.getDepositLeaves(storedContractInfo.lastQueriedBlock + 1, 0);

      console.log('populating all the leaves for chain: ', destChainIdType);
      // Only populate the leaves map if there are actually leaves to populate.
      if (leavesFromChain.newLeaves.length != 0 || storedContractInfo.leaves.length != 0) {
        leavesMap[destChainIdType.toString()] = [...storedContractInfo.leaves, ...leavesFromChain.newLeaves].map(
          (leaf) => {
            console.log(leaf);
            return hexToU8a(leaf);
          }
        );
      }
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

    const dummyUtxo = await CircomUtxo.generateUtxo({
      curve: 'Bn254',
      backend: 'Circom',
      amount: '0',
      chainId: destChainIdType.toString(),
      keypair,
    });
    const outputUtxos = [changeUtxo, dummyUtxo];

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

    let extAmount = BigNumber.from(0)
      .add(outputUtxos.reduce((sum: BigNumber, x: Utxo) => sum.add(x.amount), BigNumber.from(0)))
      .sub(inputUtxos.reduce((sum: BigNumber, x: Utxo) => sum.add(x.amount), BigNumber.from(0)));

    const { extData, outputNotes, publicInputs } = await destVAnchor.setupTransaction(
      inputUtxos,
      [changeUtxo, dummyUtxo],
      extAmount,
      0,
      recipient,
      recipient,
      leavesMap,
      provingKey,
      Buffer.from(wasmBuffer)
    );

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
          ...publicInputs,
          outputCommitments: [publicInputs.outputCommitments[0], publicInputs.outputCommitments[1]],
        },
        extData
      );
      receipt = await tx.wait();
    } catch (e) {
      this.emit('stateChange', WithdrawState.Ideal);
      console.log(e);

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
    } else {
      console.log(insertedCommitmentEvent);
      console.log(insertedCommitmentEvent.args);
    }

    const changeNote: Note = outputNotes.find((note: Note) => generateCircomCommitment(note.note) === hexCommitment)!;
    changeNote.mutateIndex(insertedCommitmentEvent.args![1].toString());

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
