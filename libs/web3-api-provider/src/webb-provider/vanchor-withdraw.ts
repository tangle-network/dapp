// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */

import type { WebbWeb3Provider } from '../webb-provider';

import {
  BridgeApi,
  NewNotesTxResult,
  RelayedChainInput,
  RelayedWithdrawResult,
  TransactionState,
  VAnchorWithdraw,
} from '@nepoche/abstract-api-provider';
import { bridgeStorageFactory, keypairStorageFactory } from '@nepoche/browser-utils/storage';
import { WebbError, WebbErrorCodes } from '@nepoche/dapp-types';
import { generateCircomCommitment, utxoFromVAnchorNote, VAnchorContract } from '@nepoche/evm-contracts';
import { fetchVAnchorKeyFromAws, fetchVAnchorWasmFromAws } from '@nepoche/fixtures-deployments';
import {
  calculateTypedChainId,
  ChainType,
  CircomUtxo,
  Keypair,
  MerkleTree,
  Note,
  NoteGenInput,
  parseTypedChainId,
  randomBN,
  toFixedHex,
  Utxo,
} from '@webb-tools/sdk-core';
import { BigNumber } from 'ethers';

import { hexToU8a, u8aToHex } from '@polkadot/util';

import { Web3Provider } from '../ext-provider';

export class Web3VAnchorWithdraw extends VAnchorWithdraw<WebbWeb3Provider> {
  protected get bridgeApi() {
    return this.inner.methods.bridgeApi as BridgeApi<WebbWeb3Provider>;
  }

  protected get config() {
    return this.inner.config;
  }

  async withdraw(notes: string[], recipient: string, amount: string): Promise<NewNotesTxResult> {
    switch (this.state) {
      case TransactionState.Cancelling:
      case TransactionState.Failed:
      case TransactionState.Done:
        this.cancelToken.reset();
        this.state = TransactionState.Ideal;
        break;
      case TransactionState.Ideal:
        break;
      default:
        throw WebbError.from(WebbErrorCodes.TransactionInProgress);
    }
    const key = 'web3-vbridge-withdraw';
    let txHash = '';
    const changeNotes = [];
    const abortSignal = this.cancelToken.abortSignal;
    try {
      const activeBridge = this.inner.methods.bridgeApi.getBridge();
      const activeRelayer = this.inner.relayerManager.activeRelayer;
      const relayerAccount = activeRelayer ? activeRelayer.beneficiary! : recipient;
      if (!activeBridge) {
        throw new Error('No activeBridge set on the web3 anchor api');
      }

      const activeChain = await this.inner.getChainId();

      const section = `Bridge ${Object.keys(activeBridge.targets)
        .map((id) => this.config.getEVMChainName(parseTypedChainId(Number(id)).chainId))
        .join('-')}`;
      this.inner.notificationHandler({
        description: 'Withdraw in progress',
        key,
        level: 'loading',
        message: `${section}:withdraw`,
        name: 'Transaction',
      });

      // set the destination contract
      const destChainIdType = calculateTypedChainId(ChainType.EVM, activeChain);
      const destAddress = activeBridge.targets[destChainIdType]!;
      const destVAnchor = this.inner.getVariableAnchorByAddress(destAddress);
      const treeHeight = await destVAnchor._contract.levels();

      // Create the proving manager - zk fixtures are fetched depending on the contract
      // max edges as well as the number of input notes.
      let wasmBuffer: Uint8Array;
      let provingKey: Uint8Array;
      this.cancelToken.throwIfCancel();
      this.emit('stateChange', TransactionState.FetchingFixtures);

      const maxEdges = await destVAnchor.inner.maxEdges();
      if (notes.length > 2) {
        provingKey = await fetchVAnchorKeyFromAws(maxEdges, false, abortSignal);
        wasmBuffer = await fetchVAnchorWasmFromAws(maxEdges, false, abortSignal);
      } else {
        provingKey = await fetchVAnchorKeyFromAws(maxEdges, true, abortSignal);
        wasmBuffer = await fetchVAnchorWasmFromAws(maxEdges, true, abortSignal);
      }

      // Loop through the notes and populate the leaves map
      const leavesMap: Record<string, Uint8Array[]> = {};

      // Keep track of the leafindices for each note
      const leafIndices: number[] = [];

      // calculate the sum of input notes (for calculating the change utxo)
      let sumInputNotes: BigNumber = BigNumber.from(0);

      // Create input UTXOs for convenience calculations
      let inputUtxos: Utxo[] = [];
      this.cancelToken.throwIfCancel();

      // For all notes, get any leaves in parallel
      this.emit('stateChange', TransactionState.FetchingLeaves);
      const notesLeaves = await Promise.all(
        notes.map((note) => this.fetchNoteLeaves(note, leavesMap, destVAnchor, treeHeight))
      );

      notesLeaves.forEach(({ amount, leafIndex, utxo }) => {
        sumInputNotes = sumInputNotes.add(amount);
        leafIndices.push(leafIndex);
        inputUtxos.push(utxo);
      });

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
        let leaves = await this.inner.getVariableAnchorLeaves(destVAnchor, leafStorage, abortSignal);

        leavesMap[destChainIdType.toString()] = leaves.map((leaf) => {
          return hexToU8a(leaf);
        });
      }

      // Check for cancelled here, abort if it was set.
      if (this.cancelToken.isCancelled()) {
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

      this.cancelToken.throwIfCancel();

      // Retrieve the user's keypair
      const keypairStorage = await keypairStorageFactory();
      const storedPrivateKey = await keypairStorage.get('keypair');
      const keypair = storedPrivateKey.keypair ? new Keypair(storedPrivateKey.keypair) : new Keypair();

      // Create the output UTXOs
      const changeAmount = sumInputNotes.sub(amount);
      const changeUtxo = await CircomUtxo.generateUtxo({
        curve: 'Bn254',
        backend: 'Circom',
        amount: changeAmount.toString(),
        chainId: destChainIdType.toString(),
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
      const worker = this.inner.wasmFactory();
      const { extData, outputNotes, publicInputs } = await this.cancelToken.handleOrThrow(
        () =>
          destVAnchor.setupTransaction(
            inputUtxos,
            [changeUtxo, dummyUtxo],
            extAmount,
            0,
            0,
            activeBridge.currency.getAddress(destChainIdType)!,
            recipient,
            relayerAccount,
            leavesMap,
            provingKey,
            Buffer.from(wasmBuffer),
            worker!
          ),
        () => {
          worker?.terminate();
          return WebbError.from(WebbErrorCodes.TransactionCancelled);
        }
      );

      // Check for cancelled here, abort if it was set.
      if (this.cancelToken.isCancelled()) {
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
      this.cancelToken.throwIfCancel();

      // set the changeNote to storage so it is not lost by user error
      if (changeAmount.gt(0)) {
        const changeNoteInput: NoteGenInput = {
          amount: changeUtxo.amount,
          backend: 'Circom',
          curve: 'Bn254',
          denomination: '18',
          exponentiation: '5',
          hashFunction: 'Poseidon',
          protocol: 'vanchor',
          secrets: [
            toFixedHex(destChainIdType, 8).substring(2),
            toFixedHex(changeUtxo.amount).substring(2),
            toFixedHex(keypair.privkey!).substring(2),
            toFixedHex(changeUtxo.blinding).substring(2),
          ].join(':'),
          sourceChain: destChainIdType.toString(),
          sourceIdentifyingData: destAddress!,
          targetChain: destChainIdType.toString(),
          targetIdentifyingData: destAddress!,
          tokenSymbol: (await Note.deserialize(notes[0])).note.tokenSymbol,
          version: 'v1',
          width: '4',
        };

        const savedChangeNote = await Note.generateNote(changeNoteInput);
        this.inner.noteManager?.addNote(savedChangeNote);
        changeNotes.push(savedChangeNote);
      }

      // Take the proof and send the transaction
      if (activeRelayer) {
        const relayedVAnchorWithdraw = await activeRelayer.initWithdraw('vAnchor');

        const parsedDestChainIdType = parseTypedChainId(destChainIdType);

        const chainInfo: RelayedChainInput = {
          baseOn: 'evm',
          contractAddress: destAddress,
          endpoint: '',
          name: parsedDestChainIdType.chainId.toString(),
        };

        const extAmount = extData.extAmount.toString().replace('0x', '');
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
              refund: extData.refund.toString(),
              token: extData.token,
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
        // Cleanup NoteAccount state
        for (const note of notes) {
          const parsedNote = await Note.deserialize(note);
          this.inner.noteManager?.removeNote(parsedNote);
        }
      } else {
        const tx = await destVAnchor.inner.transact(
          {
            ...publicInputs,
            outputCommitments: [publicInputs.outputCommitments[0], publicInputs.outputCommitments[1]],
          },
          extData
        );
        const receipt = await tx.wait();
        txHash = receipt.transactionHash;

        // Cleanup NoteAccount state
        for (const note of notes) {
          const parsedNote = await Note.deserialize(note);
          this.inner.noteManager?.removeNote(parsedNote);
        }
      }
    } catch (e) {
      // Cleanup NoteAccount state for added changeNotes
      for (const note of changeNotes) {
        this.inner.noteManager?.removeNote(note);
      }

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

  private async fetchNoteLeaves(
    note: string,
    leavesMap: Record<string, Uint8Array[]>,
    destVAnchor: VAnchorContract,
    treeHeight: number
  ): Promise<{ leafIndex: number; utxo: Utxo; amount: BigNumber }> {
    const abortSignal = this.cancelToken.abortSignal;
    const parsedNote = (await Note.deserialize(note)).note;
    const amount = BigNumber.from(parsedNote.amount);

    // fetch leaves if we don't have them
    if (leavesMap[parsedNote.sourceChainId] === undefined) {
      // Set up a provider for the source chain
      const sourceAddress = parsedNote.sourceIdentifyingData;
      const sourceChainConfig = this.config.chains[Number(parsedNote.sourceChainId)];
      const sourceHttpProvider = Web3Provider.fromUri(sourceChainConfig.url);
      const sourceEthers = sourceHttpProvider.intoEthersProvider();
      const sourceVAnchor = this.inner.getVariableAnchorByAddressAndProvider(sourceAddress, sourceEthers);
      const leafStorage = await bridgeStorageFactory(Number(parsedNote.sourceChainId));
      const leaves = await this.inner.getVariableAnchorLeaves(sourceVAnchor, leafStorage, abortSignal);

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
    console.log('Create Utxo', leafIndex);
    const utxo = await utxoFromVAnchorNote(parsedNote, leafIndex);

    return {
      leafIndex,
      utxo,
      amount,
    };
  }
}
