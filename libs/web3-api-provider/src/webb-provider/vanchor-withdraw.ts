// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */

import type { WebbWeb3Provider } from '../webb-provider';

import {
  ActiveWebbRelayer,
  BridgeApi,
  FixturesStatus,
  NewNotesTxResult,
  RelayedChainInput,
  RelayedWithdrawResult,
  Transaction,
  TransactionState,
  VAnchorWithdraw,
} from '@webb-tools/abstract-api-provider';
import {
  bridgeStorageFactory,
  keypairStorageFactory,
} from '@webb-tools/browser-utils/storage';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types';
import {
  ExtData,
  generateCircomCommitment,
  IVariableAnchorPublicInputs,
  utxoFromVAnchorNote,
  VAnchorContract,
} from '@webb-tools/evm-contracts';
import {
  fetchVAnchorKeyFromAws,
  fetchVAnchorWasmFromAws,
} from '@webb-tools/fixtures-deployments';
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
import { BigNumber, ContractTransaction, ethers } from 'ethers';

import { hexToU8a, u8aToHex } from '@polkadot/util';

import { Web3Provider } from '../ext-provider';

export class Web3VAnchorWithdraw extends VAnchorWithdraw<WebbWeb3Provider> {
  protected get bridgeApi() {
    return this.inner.methods.bridgeApi as BridgeApi<WebbWeb3Provider>;
  }

  protected get config() {
    return this.inner.config;
  }

  private async commitmentsSetup(
    treeHeight: number,
    destVAnchor: VAnchorContract,
    notes: string[],
    destChainIdType: number,
    abortSignal: AbortSignal
  ) {
    const randomKeypair = new Keypair();

    // Loop through the notes and populate the leaves map
    const leavesMap: Record<string, Uint8Array[]> = {};

    // Keep track of the leafindices for each note
    const leafIndices: number[] = [];

    // calculate the sum of input notes (for calculating the change utxo)
    let sumInputNotes: BigNumber = BigNumber.from(0);

    // Create input UTXOs for convenience calculations
    const inputUtxos: Utxo[] = [];

    const notesLeaves = await Promise.all(
      notes.map((note) =>
        this.fetchNoteLeaves(
          note,
          leavesMap,
          destVAnchor,
          treeHeight,
          abortSignal
        )
      )
    );

    notesLeaves.forEach(({ amount, leafIndex, utxo }) => {
      sumInputNotes = sumInputNotes.add(amount);
      leafIndices.push(leafIndex);
      inputUtxos.push(utxo);
    });
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
      const leaves = await this.inner.getVariableAnchorLeaves(
        destVAnchor,
        leafStorage,
        abortSignal
      );

      leavesMap[destChainIdType.toString()] = leaves.map((leaf) => {
        return hexToU8a(leaf);
      });
    }

    return {
      inputUtxos,
      leavesMap,
      sumInputNotes,
    };
  }
  /**
   * Submit the withdraw transaction throw relayer
   * */
  private async relayerWithdraw(
    extData: ExtData,
    publicInputs: IVariableAnchorPublicInputs,
    destChainIdType: number,
    destAddress: string,
    activeChain: number,
    activeRelayer: ActiveWebbRelayer,
    withdrawTx: Transaction<any>
  ): Promise<string> {
    const relayedVAnchorWithdraw = await activeRelayer.initWithdraw('vAnchor');

    const parsedDestChainIdType = parseTypedChainId(destChainIdType);

    const chainInfo: RelayedChainInput = {
      baseOn: 'evm',
      contractAddress: destAddress,
      endpoint: '',
      name: parsedDestChainIdType.chainId.toString(),
    };

    const extAmount = extData.extAmount.toString().replace('0x', '');
    const relayedDepositTxPayload =
      relayedVAnchorWithdraw.generateWithdrawRequest<
        typeof chainInfo,
        'vAnchor'
      >(chainInfo, {
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
      });

    relayedVAnchorWithdraw.watcher.subscribe(([results, message]) => {
      switch (results) {
        case RelayedWithdrawResult.PreFlight:
          /// Sending throw relayer
          break;
        case RelayedWithdrawResult.OnFlight:
          break;
        case RelayedWithdrawResult.Continue:
          break;
        case RelayedWithdrawResult.CleanExit:
          // Done state
          break;
        case RelayedWithdrawResult.Errored:
          // Tx failed
          withdrawTx.fail(message);
          break;
      }
    });

    relayedVAnchorWithdraw.send(relayedDepositTxPayload);
    const results = await relayedVAnchorWithdraw.await();
    if (results) {
      const [, message] = results;
      return message;
    }
    throw new Error('Failed to use the relayer');
  }
  /**
   * Fetch the vAnchor fixtures
   * */
  private static async fetchFixtures(
    maxEdges: number,
    small: boolean,
    abortSignal: AbortSignal,
    fixturesList: Map<string, FixturesStatus>
  ) {
    fixturesList.set('VAnchorKey', 'Waiting');
    fixturesList.set('VAnchorWasm', 'Waiting');
    fixturesList.set('VAnchorKey', 0);
    const provingKey = await fetchVAnchorKeyFromAws(
      maxEdges,
      small,
      abortSignal
    );
    fixturesList.set('VAnchorKey', 'Done');
    fixturesList.set('VAnchorWasm', 0);
    const wasmBuffer = await fetchVAnchorWasmFromAws(
      maxEdges,
      small,
      abortSignal
    );
    fixturesList.set('VAnchorWasm', 'Done');
    return {
      provingKey,
      wasmBuffer,
    };
  }
  withdraw(
    notes: string[],
    recipient: string,
    amount: string,
    metadataNote: Note,
    unwrapTokenAddress?: string
  ): Transaction<NewNotesTxResult> {
    const { note } = metadataNote;
    const denomination = note.denomination;
    const formattedAmount = ethers.utils.formatUnits(amount, denomination);
    const srcChainId = note.sourceChainId;
    const distChainId = note.targetChainId;
    const currencySymbol = note.tokenSymbol;
    const wrappabledAssetAddress: string | undefined = unwrapTokenAddress;
    const srcSymbol = wrappabledAssetAddress
      ? this.inner.config.getCurrencyByAddress(wrappabledAssetAddress).symbol
      : currencySymbol;

    const withdrawTx = Transaction.new<NewNotesTxResult>('Withdraw', {
      wallets: { src: Number(srcChainId), dist: Number(distChainId) },
      tokens: [srcSymbol, currencySymbol],
      token: currencySymbol,
      amount: Number(formattedAmount),
    });
    const executor = async () => {
      const abortSignal = withdrawTx.cancelToken.abortSignal;

      const txHash = '';
      const changeNotes: Note[] = [];
      try {
        const activeBridge = this.inner.methods.bridgeApi.getBridge();
        const activeRelayer = this.inner.relayerManager.activeRelayer;
        const relayerAccount = activeRelayer
          ? activeRelayer.beneficiary
          : recipient;
        if (!activeBridge) {
          withdrawTx.fail('No activeBridge set on the web3 anchor api');
        }

        const activeChain = await this.inner.getChainId();

        // set the destination contract
        const destChainIdType = calculateTypedChainId(
          ChainType.EVM,
          activeChain
        );
        const destAddress = activeBridge.targets[destChainIdType];
        const destVAnchor = this.inner.getVariableAnchorByAddress(destAddress);
        const treeHeight = await destVAnchor._contract.levels();

        // Create the proving manager - zk fixtures are fetched depending on the contract
        // max edges as well as the number of input notes.

        withdrawTx.cancelToken.throwIfCancel();

        const fixturesList = new Map<string, FixturesStatus>();

        withdrawTx.next(TransactionState.FetchingFixtures, {
          fixturesList,
        });
        const maxEdges = await destVAnchor.inner.maxEdges();
        const small = notes.length <= 2;
        const { provingKey, wasmBuffer } =
          await Web3VAnchorWithdraw.fetchFixtures(
            maxEdges,
            small,
            abortSignal,
            fixturesList
          );

        // calculate the sum of input notes (for calculating the change utxo)

        withdrawTx.cancelToken.throwIfCancel();
        const { inputUtxos, leavesMap, sumInputNotes } =
          await this.commitmentsSetup(
            treeHeight,
            destVAnchor,
            notes,
            destChainIdType,
            abortSignal
          );
        // Retrieve the user's keypair
        const keypairStorage = await keypairStorageFactory();
        const storedPrivateKey = await keypairStorage.get('keypair');
        const keypair = storedPrivateKey.keypair
          ? new Keypair(storedPrivateKey.keypair)
          : new Keypair();

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

        const extAmount = BigNumber.from(0)
          .add(
            outputUtxos.reduce(
              (sum: BigNumber, x: Utxo) => sum.add(x.amount),
              BigNumber.from(0)
            )
          )
          .sub(
            inputUtxos.reduce(
              (sum: BigNumber, x: Utxo) => sum.add(x.amount),
              BigNumber.from(0)
            )
          );

        withdrawTx.next(TransactionState.GeneratingZk, undefined);
        const worker = this.inner.wasmFactory();
        const { extData, publicInputs } =
          await withdrawTx.cancelToken.handleOrThrow(
            () =>
              destVAnchor.setupTransaction(
                inputUtxos,
                [changeUtxo, dummyUtxo],
                extAmount,
                0,
                0,
                activeBridge.currency.getAddress(destChainIdType),
                recipient,
                relayerAccount,
                leavesMap,
                provingKey,
                Buffer.from(wasmBuffer),
                worker
              ),
            () => {
              worker?.terminate();
              return WebbError.from(WebbErrorCodes.TransactionCancelled);
            }
          );

        withdrawTx.cancelToken.throwIfCancel();

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
              toFixedHex(keypair.privkey).substring(2),
              toFixedHex(`0x${changeUtxo.blinding}`).substring(2),
            ].join(':'),
            sourceChain: destChainIdType.toString(),
            sourceIdentifyingData: destAddress,
            targetChain: destChainIdType.toString(),
            targetIdentifyingData: destAddress,
            tokenSymbol: (await Note.deserialize(notes[0])).note.tokenSymbol,
            version: 'v1',
            width: '4',
          };

          const savedChangeNote = await Note.generateNote(changeNoteInput);
          await this.inner.noteManager?.addNote(savedChangeNote);
          changeNotes.push(savedChangeNote);
        }

        // Take the proof and send the transaction
        if (activeRelayer) {
          withdrawTx.next(
            TransactionState.SendingTransaction,
            `Relayer:${activeRelayer.beneficiary}`
          );
          const txHash = await this.relayerWithdraw(
            extData,
            publicInputs,
            destChainIdType,
            destAddress,
            activeChain,
            activeRelayer,
            withdrawTx
          );
          withdrawTx.txHash = txHash;
          // Cleanup NoteAccount state
          for (const note of notes) {
            const parsedNote = await Note.deserialize(note);
            await this.inner.noteManager?.removeNote(parsedNote);
          }
        } else {
          let tx: ContractTransaction;
          withdrawTx.next(TransactionState.SendingTransaction, undefined);
          if (unwrapTokenAddress) {
            tx = await destVAnchor.inner.transactWrap(
              {
                ...publicInputs,
                outputCommitments: [
                  publicInputs.outputCommitments[0],
                  publicInputs.outputCommitments[1],
                ],
              },
              extData,
              unwrapTokenAddress,
              {
                gasLimit: 10000000 * 9,
              }
            );
          } else {
            tx = await destVAnchor.inner.transact(
              {
                ...publicInputs,
                outputCommitments: [
                  publicInputs.outputCommitments[0],
                  publicInputs.outputCommitments[1],
                ],
              },
              extData,
              {
                gasLimit: 10000000 + 9,
              }
            );
          }

          const receipt = await tx.wait();
          withdrawTx.txHash = receipt.transactionHash;
          // Cleanup NoteAccount state
          for (const note of notes) {
            const parsedNote = await Note.deserialize(note);
            await this.inner.noteManager?.removeNote(parsedNote);
          }
        }
      } catch (e) {
        // Cleanup NoteAccount state for added changeNotes
        for (const note of changeNotes) {
          await this.inner.noteManager?.removeNote(note);
        }
        // TODO: check the value for the error for better message
        withdrawTx.fail(e);
      }

      withdrawTx.next(TransactionState.Done, {
        txHash: txHash,
        outputNotes: changeNotes,
      });
      return {
        txHash: txHash,
        outputNotes: changeNotes,
      };
    };
    withdrawTx.executor(executor);
    return withdrawTx;
  }

  private async fetchNoteLeaves(
    note: string,
    leavesMap: Record<string, Uint8Array[]>,
    destVAnchor: VAnchorContract,
    treeHeight: number,
    abortSignal: AbortSignal
  ): Promise<{ leafIndex: number; utxo: Utxo; amount: BigNumber }> {
    const parsedNote = (await Note.deserialize(note)).note;
    const amount = BigNumber.from(parsedNote.amount);

    // fetch leaves if we don't have them
    if (leavesMap[parsedNote.sourceChainId] === undefined) {
      // Set up a provider for the source chain
      const sourceAddress = parsedNote.sourceIdentifyingData;
      const sourceChainConfig =
        this.config.chains[Number(parsedNote.sourceChainId)];
      const sourceHttpProvider = Web3Provider.fromUri(sourceChainConfig.url);
      const sourceEthers = sourceHttpProvider.intoEthersProvider();
      const sourceVAnchor = this.inner.getVariableAnchorByAddressAndProvider(
        sourceAddress,
        sourceEthers
      );
      const leafStorage = await bridgeStorageFactory(
        Number(parsedNote.sourceChainId)
      );
      const leaves = await this.inner.getVariableAnchorLeaves(
        sourceVAnchor,
        leafStorage,
        abortSignal
      );

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
      const edgeIndex = await destVAnchor.inner.edgeIndex(
        parsedNote.sourceChainId
      );
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

    const provingLeaves = provingTree
      .elements()
      .map((el) => hexToU8a(el.toHexString()));
    leavesMap[parsedNote.sourceChainId] = provingLeaves;
    const commitment = generateCircomCommitment(parsedNote);
    const leafIndex = provingTree.getIndexByElement(commitment);
    const utxo = await utxoFromVAnchorNote(parsedNote, leafIndex);

    return {
      leafIndex,
      utxo,
      amount,
    };
  }
}
