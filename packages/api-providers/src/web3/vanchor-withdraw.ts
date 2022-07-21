// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */

import type { WebbWeb3Provider } from './webb-provider';

import {
  calculateTypedChainId,
  ChainType,
  CircomUtxo,
  Keypair,
  MerkleTree,
  Note,
  parseTypedChainId,
  randomBN,
  Utxo,
} from '@webb-tools/sdk-core';
import { BigNumber } from 'ethers';

import { hexToU8a, u8aToHex } from '@polkadot/util';

import {
  AnchorApi,
  RelayedChainInput,
  RelayedWithdrawResult,
  TransactionState,
  VAnchorWithdraw,
  VAnchorWithdrawResult,
} from '../abstracts';
import { evmIdIntoInternalChainId, internalChainIdIntoEVMId, typedChainIdToInternalId } from '../chains';
import { generateCircomCommitment, utxoFromVAnchorNote } from '../contracts/wrappers';
import { Web3Provider } from '../ext-providers/web3/web3-provider';
import { fetchVariableAnchorKeyForEdges, fetchVariableAnchorWasmForEdges } from '../ipfs/evm/anchors';
import { BridgeConfig } from '../types/bridge-config.interface';
import { bridgeStorageFactory, getEVMChainNameFromInternal, keypairStorageFactory } from '../utils';

export class Web3VAnchorWithdraw extends VAnchorWithdraw<WebbWeb3Provider> {
  protected get bridgeApi() {
    return this.inner.methods.anchorApi as AnchorApi<WebbWeb3Provider, BridgeConfig>;
  }

  protected get config() {
    return this.inner.config;
  }

  async withdraw(notes: string[], recipient: string, amount: string): Promise<VAnchorWithdrawResult> {
    this.cancelToken.cancelled = false;
    const key = 'web3-vbridge-withdraw';
    let txHash = '';
    const changeNotes = [];

    try {
      const activeBridge = this.bridgeApi.activeBridge;
      const activeRelayer = this.inner.relayerManager.activeRelayer;
      const relayerAccount = activeRelayer ? activeRelayer.beneficiary! : recipient;
      if (!activeBridge) {
        throw new Error('No activeBridge set on the web3 anchor api');
      }

      const anchorConfigsForBridge = activeBridge.anchors.find((anchor) => anchor.type === 'variable')!;

      const section = `Bridge ${Object.keys(anchorConfigsForBridge.anchorAddresses)
        .map((id) => getEVMChainNameFromInternal(this.config, Number(id)))
        .join('-')}`;
      this.inner.notificationHandler({
        description: 'Withdraw in progress',
        key,
        level: 'loading',
        message: `${section}:withdraw`,
        name: 'Transaction',
      });

      // set the destination contract
      const activeChain = await this.inner.getChainId();
      const destChainIdType = calculateTypedChainId(ChainType.EVM, activeChain);
      const internalId = evmIdIntoInternalChainId(activeChain);
      const destAddress = anchorConfigsForBridge.anchorAddresses[internalId]!;
      const destVAnchor = await this.inner.getVariableAnchorByAddress(destAddress);
      const treeHeight = await destVAnchor._contract.levels();

      // Create the proving manager - zk fixtures are fetched depending on the contract
      // max edges as well as the number of input notes.
      let wasmBuffer: Uint8Array;
      let provingKey: Uint8Array;

      this.emit('stateChange', TransactionState.FetchingFixtures);

      const maxEdges = await destVAnchor.inner.maxEdges();
      if (notes.length > 2) {
        provingKey = await fetchVariableAnchorKeyForEdges(maxEdges, false);
        wasmBuffer = await fetchVariableAnchorWasmForEdges(maxEdges, false);
      } else {
        provingKey = await fetchVariableAnchorKeyForEdges(maxEdges, true);
        wasmBuffer = await fetchVariableAnchorWasmForEdges(maxEdges, true);
      }

      // Loop through the notes and populate the leaves map
      const leavesMap: Record<string, Uint8Array[]> = {};

      // Keep track of the leafindices for each note
      const leafIndices: number[] = [];

      // calculate the sum of input notes (for calculating the change utxo)
      let sumInputNotes: BigNumber = BigNumber.from(0);

      // Create input UTXOs for convenience calculations
      let inputUtxos: Utxo[] = [];

      // For all notes, get any leaves
      this.emit('stateChange', TransactionState.FetchingLeaves);
      for (const note of notes) {
        const parsedNote = (await Note.deserialize(note)).note;
        sumInputNotes = BigNumber.from(parsedNote.amount).add(sumInputNotes);

        // fetch leaves if we don't have them
        if (leavesMap[parsedNote.sourceChainId] === undefined) {
          // Set up a provider for the source chain
          const sourceAddress = parsedNote.sourceIdentifyingData;
          const sourceChainIdType = parseTypedChainId(Number(parsedNote.sourceChainId));
          const sourceInternalId = evmIdIntoInternalChainId(sourceChainIdType.chainId);
          const sourceChainConfig = this.config.chains[sourceInternalId];
          const sourceHttpProvider = Web3Provider.fromUri(sourceChainConfig.url);
          const sourceEthers = sourceHttpProvider.intoEthersProvider();
          const sourceVAnchor = await this.inner.getVariableAnchorByAddressAndProvider(sourceAddress, sourceEthers);
          const leafStorage = await bridgeStorageFactory(Number(parsedNote.sourceChainId));
          const leaves = await this.inner.getVariableAnchorLeaves(sourceVAnchor, leafStorage);

          leavesMap[parsedNote.sourceChainId] = leaves.map((leaf) => {
            return hexToU8a(leaf);
          });
        }

        let destHistorySourceRoot: string;

        // Get the latest root that has been relayed from the source chain to the destination chain
        if (parsedNote.sourceChainId === parsedNote.targetChainId) {
          const destRoot = await destVAnchor.inner.getLastRoot();
          destHistorySourceRoot = destRoot;
        } else {
          const edgeIndex = await destVAnchor.inner.edgeIndex(parsedNote.sourceChainId);
          const edge = await destVAnchor.inner.edgeList(edgeIndex);
          destHistorySourceRoot = edge[1];
        }

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
        const provingLeaves = provingTree.elements().map((el) => hexToU8a(el.toHexString()));
        leavesMap[parsedNote.sourceChainId] = provingLeaves;
        const commitment = generateCircomCommitment(parsedNote);
        const leafIndex = provingTree.getIndexByElement(commitment);
        leafIndices.push(leafIndex);
        console.log('Create Utxo', leafIndex);
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

      // Populate the leaves for the destination if not already populated
      if (!leavesMap[destChainIdType.toString()]) {
        const leafStorage = await bridgeStorageFactory(destChainIdType);
        let leaves = await this.inner.getVariableAnchorLeaves(destVAnchor, leafStorage);

        leavesMap[destChainIdType.toString()] = leaves.map((leaf) => {
          return hexToU8a(leaf);
        });
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
        this.emit('stateChange', TransactionState.Ideal);

        return {
          txHash: '',
          outputNotes: [],
        };
      }

      // Retrieve the user's keypair
      const keypairStorage = await keypairStorageFactory();
      const storedPrivateKey = await keypairStorage.get('keypair');
      const keypair = new Keypair(storedPrivateKey.keypair);

      // Create the output UTXOs
      const changeAmount = sumInputNotes.sub(amount);
      const changeUtxo = await CircomUtxo.generateUtxo({
        curve: 'Bn254',
        backend: 'Circom',
        amount: changeAmount.toString(),
        chainId: destChainIdType.toString(),
        privateKey: hexToU8a(storedPrivateKey.keypair),
        keypair,
        originChainId: destChainIdType.toString(),
      });

      const dummyUtxo = await CircomUtxo.generateUtxo({
        curve: 'Bn254',
        backend: 'Circom',
        amount: '0',
        chainId: destChainIdType.toString(),
        keypair,
      });
      const outputUtxos = [changeUtxo, dummyUtxo];

      let extAmount = BigNumber.from(0)
        .add(outputUtxos.reduce((sum: BigNumber, x: Utxo) => sum.add(x.amount), BigNumber.from(0)))
        .sub(inputUtxos.reduce((sum: BigNumber, x: Utxo) => sum.add(x.amount), BigNumber.from(0)));
      this.emit('stateChange', TransactionState.GeneratingZk);
      const { extData, outputNotes, publicInputs } = await destVAnchor.setupTransaction(
        inputUtxos,
        [changeUtxo, dummyUtxo],
        extAmount,
        0,
        recipient,
        relayerAccount,
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
        this.emit('stateChange', TransactionState.Ideal);

        return {
          txHash: '',
          outputNotes: [],
        };
      }

      this.emit('stateChange', TransactionState.SendingTransaction);

      // Take the proof and send the transaction
      if (activeRelayer) {
        const relayedVAnchorWithdraw = await activeRelayer.initWithdraw('vAnchor');

        const parsedDestChainIdType = parseTypedChainId(destChainIdType);
        const destInternalId = typedChainIdToInternalId(parsedDestChainIdType);
        const chainName = internalChainIdIntoEVMId(destInternalId);

        const chainInfo: RelayedChainInput = {
          baseOn: 'evm',
          contractAddress: destAddress,
          endpoint: '',
          name: chainName.toString(),
        };

        const extAmount = extData.extAmount.replace('0x', '');
        const relayedDepositTxPayload = relayedVAnchorWithdraw.generateWithdrawRequest<typeof chainInfo, 'vAnchor'>(
          chainInfo,
          {
            chainId: activeChain,
            id: destAddress,
            extData: {
              recipient: extData.recipient,
              relayer: extData.relayer,
              extAmount: extAmount as any,
              fee: extData.fee.toString() as any,
              encryptedOutput1: extData.encryptedOutput1,
              encryptedOutput2: extData.encryptedOutput2,
            },
            proofData: {
              proof: publicInputs.proof,
              extDataHash: publicInputs.extDataHash,
              publicAmount: publicInputs.publicAmount,
              roots: publicInputs.roots,
              outputCommitments: publicInputs.outputCommitments,
              inputNullifiers: publicInputs.inputNullifiers,
            },
          }
        );

        relayedVAnchorWithdraw.watcher.subscribe(([results, message]) => {
          switch (results) {
            case RelayedWithdrawResult.PreFlight:
              this.emit('stateChange', TransactionState.SendingTransaction);
              break;
            case RelayedWithdrawResult.OnFlight:
              break;
            case RelayedWithdrawResult.Continue:
              break;
            case RelayedWithdrawResult.CleanExit:
              this.emit('stateChange', TransactionState.Done);
              this.emit('stateChange', TransactionState.Ideal);

              this.inner.notificationHandler({
                description: `TX hash:`,
                key: 'vanchor-withdraw-sub',
                level: 'success',
                message: 'vanchor254:withdraw',
                name: 'Transaction',
              });

              break;
            case RelayedWithdrawResult.Errored:
              this.emit('stateChange', TransactionState.Failed);
              this.emit('stateChange', TransactionState.Ideal);

              this.inner.notificationHandler({
                description: message || 'Withdraw failed',
                key: 'vanchor-withdraw-sub',
                level: 'success',
                message: 'vanchor254:withdraw',
                name: 'Transaction',
              });
              break;
          }
        });

        this.inner.notificationHandler({
          description: 'Sending TX to relayer',
          key: 'vanchor-withdraw-sub',
          level: 'loading',
          message: 'vanchor254:withdraw',

          name: 'Transaction',
        });
        relayedVAnchorWithdraw.send(relayedDepositTxPayload);
        const results = await relayedVAnchorWithdraw.await();
        if (results) {
          const [, message] = results;
          txHash = message!;
        }
        const hexCommitment = u8aToHex(changeUtxo.commitment);
        const changeNote: Note = outputNotes.find(
          (note: Note) => generateCircomCommitment(note.note) === hexCommitment
        )!;
        changeNotes.push(changeNote);
      } else {
        const tx = await destVAnchor.inner.transact(
          {
            ...publicInputs,
            outputCommitments: [publicInputs.outputCommitments[0], publicInputs.outputCommitments[1]],
          },
          extData
        );
        const receipt = await tx.wait();
        // Parse the events for the index of the changeUTXO
        const hexCommitment = u8aToHex(changeUtxo.commitment);

        const insertedCommitmentEvent = receipt.events?.find(
          (event) => event.event === 'Insertion' && event.args?.includes(hexCommitment)
        );

        if (!insertedCommitmentEvent) {
          throw new Error("Uh oh, we didn't find our commitment in the insertions... inserted garbage");
        }

        const changeNote: Note = outputNotes.find(
          (note: Note) => generateCircomCommitment(note.note) === hexCommitment
        )!;
        const nextIndex = insertedCommitmentEvent.args![1].toString();
        console.log(`NextIndex ${nextIndex}`);
        changeNote.mutateIndex(nextIndex);
        changeNotes.push(changeNote);
        txHash = receipt.transactionHash;
      }
    } catch (e) {
      this.emit('stateChange', TransactionState.Ideal);
      console.log(e);

      this.inner.notificationHandler({
        description: (e as any)?.code === 4001 ? 'Withdraw rejected' : 'Withdraw failed',
        key,
        level: 'error',
        message: `web3-vanchor:withdraw`,
        name: 'Transaction',
      });

      return {
        txHash: '',
        outputNotes: [],
      };
    }

    this.emit('stateChange', TransactionState.Ideal);
    this.inner.notificationHandler({
      description: recipient,
      key,
      level: 'success',
      message: 'vanchor254:withdraw',
      name: 'Transaction',
    });

    return {
      txHash: txHash,
      outputNotes: changeNotes,
    };
  }
}
