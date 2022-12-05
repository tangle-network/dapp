import {
  BridgeApi,
  FixturesStatus,
  NewNotesTxResult,
  RelayedChainInput,
  RelayedWithdrawResult,
  Transaction,
  TransactionState,
  VAnchorTransfer,
  VanchorTransferPayload,
} from '@webb-tools/abstract-api-provider';
import {
  bridgeStorageFactory,
  keypairStorageFactory,
} from '@webb-tools/browser-utils/storage';
import { WebbError, WebbErrorCodes, zeroAddress } from '@webb-tools/dapp-types';
import {
  generateCircomCommitment,
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
import { BigNumber, ethers } from 'ethers';
import { hexToU8a, u8aToHex } from '@polkadot/util';
import { ChainIcon } from '@webb-tools/icons';

import { Web3Provider } from '../ext-provider';
import { WebbWeb3Provider } from '../webb-provider';

export class Web3VAnchorTransfer extends VAnchorTransfer<WebbWeb3Provider> {
  protected get bridgeApi() {
    return this.inner.methods.bridgeApi as BridgeApi<WebbWeb3Provider>;
  }

  protected get config() {
    return this.inner.config;
  }

  transfer(
    transferData: VanchorTransferPayload
  ): Transaction<NewNotesTxResult> {
    const { amount } = transferData;
    const note = transferData.inputNotes[0];
    if (!note) {
      throw new Error('No input note provided');
    }

    const { denomination } = note.note;
    const formattedAmount = ethers.utils.formatUnits(amount, denomination);

    const sourceChain = transferData.activeChain;
    const targetChainId = transferData.targetTypedChainId;
    const targetChain = this.config.chains[targetChainId];

    const transferTx = Transaction.new<NewNotesTxResult>('Transfer', {
      wallets: {
        src: <ChainIcon name={sourceChain?.name} />,
        dist: <ChainIcon name={targetChain?.name} />,
      },
      tokens: [note.note.tokenSymbol, note.note.tokenSymbol],
      token: note.note.tokenSymbol,
      amount: Number(formattedAmount),
    });

    const executeTransfer = async () => {
      let txHash = '';
      const changeNotes: Note[] = [];
      const abortSignal = transferTx.cancelToken.abortSignal;

      try {
        const activeBridge = this.inner.methods.bridgeApi.getBridge();
        const activeRelayer = this.inner.relayerManager.activeRelayer;
        const relayerAccount = activeRelayer
          ? activeRelayer.beneficiary
          : zeroAddress;
        if (!activeBridge) {
          transferTx.fail('No activeBridge set on the web3 anchor api');
        }

        const activeChain = await this.inner.getChainId();

        // set the anchor to make the transfer on (where the notes are being spent for the transfer)
        const sourceChainIdType = calculateTypedChainId(
          ChainType.EVM,
          activeChain
        );
        const srcAddress = activeBridge.targets[sourceChainIdType];
        const anchor = this.inner.getVariableAnchorByAddress(srcAddress);
        const treeHeight = await anchor._contract.levels();

        // Create the proving manager - zk fixtures are fetched depending on the contract
        // max edges as well as the number of input notes.
        let wasmBuffer: Uint8Array;
        let provingKey: Uint8Array;

        // The fixtures map to track the fixtures status
        const fixturesList = new Map<string, FixturesStatus>();

        transferTx.cancelToken.throwIfCancel();
        this.emit('stateChange', TransactionState.FetchingFixtures);

        const maxEdges = await anchor.inner.maxEdges();
        fixturesList.set('VAnchorKey', 'Waiting');
        fixturesList.set('VAnchorWasm', 'Waiting');
        transferTx.next(TransactionState.FetchingFixtures, {
          fixturesList,
        });

        if (transferData.inputNotes.length > 2) {
          fixturesList.set('VAnchorKey', 0);
          provingKey = await fetchVAnchorKeyFromAws(
            maxEdges,
            false,
            abortSignal
          );
          fixturesList.set('VAnchorKey', 'Done');

          fixturesList.set('VAnchorWasm', 0);
          wasmBuffer = await fetchVAnchorWasmFromAws(
            maxEdges,
            false,
            abortSignal
          );
          fixturesList.set('VAnchorWasm', 'Done');
        } else {
          fixturesList.set('VAnchorKey', 0);
          provingKey = await fetchVAnchorKeyFromAws(
            maxEdges,
            true,
            abortSignal
          );
          fixturesList.set('VAnchorKey', 'Done');

          fixturesList.set('VAnchorWasm', 0);
          wasmBuffer = await fetchVAnchorWasmFromAws(
            maxEdges,
            true,
            abortSignal
          );
          fixturesList.set('VAnchorWasm', 'Done');
        }

        transferTx.cancelToken.throwIfCancel();

        // Loop through the notes and populate the leaves map
        const leavesMap: Record<string, Uint8Array[]> = {};

        // Keep track of the leafindices for each note
        const leafIndices: number[] = [];

        // calculate the sum of input notes (for calculating the change utxo)
        let sumInputNotes: BigNumber = BigNumber.from(0);

        // Create input UTXOs for convenience calculations
        const inputUtxos: Utxo[] = [];
        transferTx.cancelToken.throwIfCancel();

        this.emit('stateChange', TransactionState.FetchingLeaves);
        transferTx.next(TransactionState.FetchingLeaves, {
          end: undefined,
          currentRange: [0, 1],
          start: 0,
        });

        // For all notes, get any leaves in parallel
        const notesLeaves = await Promise.all(
          transferData.inputNotes.map((note) =>
            this.fetchNoteLeaves(note, leavesMap, anchor, treeHeight)
          )
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
              chainId: sourceChainIdType.toString(),
              originChainId: sourceChainIdType.toString(),
              amount: '0',
              blinding: hexToU8a(randomBN(31).toHexString()),
              keypair: randomKeypair,
            })
          );
        }

        // Check for cancelled here, abort if it was set.
        if (transferTx.cancelToken.isCancelled()) {
          this.emit('stateChange', TransactionState.Ideal);
          transferTx.fail('Transaction cancelled');

          return {
            txHash: '',
            outputNotes: [],
          };
        }

        transferTx.cancelToken.throwIfCancel();

        // Retrieve the user's keypair
        const keypairStorage = await keypairStorageFactory();
        const storedPrivateKey = await keypairStorage.get('keypair');
        const changeKeypair = storedPrivateKey.keypair
          ? new Keypair(storedPrivateKey.keypair)
          : new Keypair();

        // Setup the recipient's keypair.
        const recipientKeypair = Keypair.fromString(transferData.recipient);

        // Create the output UTXOs
        const changeAmount = sumInputNotes.sub(transferData.amount);
        const changeUtxo = await CircomUtxo.generateUtxo({
          curve: 'Bn254',
          backend: 'Circom',
          amount: changeAmount.toString(),
          chainId: sourceChainIdType.toString(),
          keypair: changeKeypair,
          originChainId: sourceChainIdType.toString(),
        });
        const transferUtxo = await CircomUtxo.generateUtxo({
          curve: 'Bn254',
          backend: 'Circom',
          amount: transferData.amount,
          chainId: transferData.targetTypedChainId.toString(),
          keypair: recipientKeypair,
          originChainId: sourceChainIdType.toString(),
        });

        this.emit('stateChange', TransactionState.GeneratingZk);
        transferTx.next(TransactionState.GeneratingZk, undefined);
        const worker = this.inner.wasmFactory();
        const { extData, publicInputs } =
          await transferTx.cancelToken.handleOrThrow(
            () =>
              anchor.setupTransaction(
                inputUtxos,
                [changeUtxo, transferUtxo],
                0, // the extAmount for a transfer should be zero
                0,
                0,
                activeBridge.currency.getAddress(sourceChainIdType),
                relayerAccount,
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

        // Check for cancelled here, abort if it was set.
        if (transferTx.cancelToken.isCancelled()) {
          this.emit('stateChange', TransactionState.Ideal);
          transferTx.fail('Transaction cancelled');

          return {
            txHash: '',
            outputNotes: [],
          };
        }

        this.emit('stateChange', TransactionState.SendingTransaction);
        transferTx.next(TransactionState.SendingTransaction, undefined);
        transferTx.cancelToken.throwIfCancel();

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
              toFixedHex(sourceChainIdType, 8).substring(2),
              toFixedHex(changeUtxo.amount).substring(2),
              toFixedHex(changeKeypair.privkey).substring(2),
              toFixedHex('0x' + changeUtxo.blinding).substring(2),
            ].join(':'),
            sourceChain: sourceChainIdType.toString(),
            sourceIdentifyingData: srcAddress,
            targetChain: sourceChainIdType.toString(),
            targetIdentifyingData: srcAddress,
            tokenSymbol: note.note.tokenSymbol,
            version: 'v1',
            width: '4',
          };

          const savedChangeNote = await Note.generateNote(changeNoteInput);
          this.inner.noteManager?.addNote(savedChangeNote);
          changeNotes.push(savedChangeNote);
        }

        // Take the proof and send the transaction
        if (activeRelayer) {
          const relayedVAnchorWithdraw = await activeRelayer.initWithdraw(
            'vAnchor'
          );

          const parsedDestChainIdType = parseTypedChainId(sourceChainIdType);

          const chainInfo: RelayedChainInput = {
            baseOn: 'evm',
            contractAddress: srcAddress,
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
              id: srcAddress,
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
                this.emit('stateChange', TransactionState.SendingTransaction);
                transferTx.next(TransactionState.SendingTransaction, undefined);
                break;
              case RelayedWithdrawResult.OnFlight:
                break;
              case RelayedWithdrawResult.Continue:
                break;
              case RelayedWithdrawResult.CleanExit:
                this.emit('stateChange', TransactionState.Done);
                transferTx.next(TransactionState.Done, {
                  txHash,
                  outputNotes: changeNotes,
                });
                break;
              case RelayedWithdrawResult.Errored:
                this.emit('stateChange', TransactionState.Failed);
                transferTx.fail('Transaction with relayer failed');
                break;
            }
          });

          transferTx.next(TransactionState.Intermediate, {
            name: 'Sending TX to relayer',
          });

          relayedVAnchorWithdraw.send(relayedDepositTxPayload);
          const results = await relayedVAnchorWithdraw.await();
          if (results) {
            const [, message] = results;
            txHash = message;
          }
          // Cleanup NoteAccount state
          for (const note of transferData.inputNotes) {
            this.inner.noteManager?.removeNote(note);
          }
        } else {
          const tx = await anchor.inner.transact(
            {
              ...publicInputs,
              outputCommitments: [
                publicInputs.outputCommitments[0],
                publicInputs.outputCommitments[1],
              ],
            },
            extData
          );

          transferTx.next(TransactionState.SendingTransaction, tx.hash);

          const receipt = await tx.wait();
          txHash = receipt.transactionHash;

          // Cleanup NoteAccount state
          for (const note of transferData.inputNotes) {
            this.inner.noteManager?.removeNote(note);
          }
        }

        this.emit('stateChange', TransactionState.Done);
        transferTx.next(TransactionState.Done, {
          txHash,
          outputNotes: changeNotes,
        });
      } catch (e) {
        // Cleanup NoteAccount state for added changeNotes
        for (const note of changeNotes) {
          this.inner.noteManager?.removeNote(note);
        }

        let description = '';
        const isUserCancel =
          e instanceof WebbError &&
          e.code === WebbErrorCodes.TransactionCancelled;

        if (e?.code === 4001) {
          description = 'User Rejected Deposit';
        } else if (isUserCancel) {
          description = 'User Cancelled Transaction';
        } else {
          description = 'Deposit Transaction Failed';
        }

        this.emit('stateChange', TransactionState.Failed);
        transferTx.fail(description);
        console.log(e);

        return {
          txHash: '',
          outputNotes: [],
        };
      }

      return {
        txHash: txHash,
        outputNotes: changeNotes,
      };
    };

    transferTx.executor(executeTransfer);
    return transferTx;
  }

  private async fetchNoteLeaves(
    note: Note,
    leavesMap: Record<string, Uint8Array[]>,
    destVAnchor: VAnchorContract,
    treeHeight: number
  ): Promise<{ leafIndex: number; utxo: Utxo; amount: BigNumber }> {
    const abortSignal = this.cancelToken.abortSignal;
    const parsedNote = note.note;
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
    console.log('Create Utxo', leafIndex);
    const utxo = await utxoFromVAnchorNote(parsedNote, leafIndex);

    return {
      leafIndex,
      utxo,
      amount,
    };
  }
}
