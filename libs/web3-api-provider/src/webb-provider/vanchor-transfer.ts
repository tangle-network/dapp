import {
  Account,
  BridgeApi,
  NewNotesTxResult,
  RelayedChainInput,
  RelayedWithdrawResult,
  TransactionState,
  VAnchorTransfer,
  VanchorTransferPayload,
} from '@nepoche/abstract-api-provider';
import { bridgeStorageFactory, keypairStorageFactory } from '@nepoche/browser-utils/storage';
import { WebbError, WebbErrorCodes, zeroAddress } from '@nepoche/dapp-types';
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
import { WebbWeb3Provider } from '../webb-provider';

export class Web3VAnchorTransfer extends VAnchorTransfer<WebbWeb3Provider> {
  protected get bridgeApi() {
    return this.inner.methods.bridgeApi as BridgeApi<WebbWeb3Provider>;
  }

  protected get config() {
    return this.inner.config;
  }

  async transfer(transferData: VanchorTransferPayload): Promise<NewNotesTxResult> {
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
    const changeNotes: Note[] = [];
    const abortSignal = this.cancelToken.abortSignal;

    try {
      const activeBridge = this.inner.methods.bridgeApi.getBridge();
      const activeRelayer = this.inner.relayerManager.activeRelayer;
      const relayerAccount = activeRelayer ? activeRelayer.beneficiary! : zeroAddress;
      if (!activeBridge) {
        throw new Error('No activeBridge set on the web3 anchor api');
      }

      const activeChain = await this.inner.getChainId();

      // set the anchor to make the transfer on (where the notes are being spent for the transfer)
      const sourceChainIdType = calculateTypedChainId(ChainType.EVM, activeChain);
      const srcAddress = activeBridge.targets[sourceChainIdType]!;
      const anchor = this.inner.getVariableAnchorByAddress(srcAddress);
      const treeHeight = await anchor._contract.levels();

      // Create the proving manager - zk fixtures are fetched depending on the contract
      // max edges as well as the number of input notes.
      let wasmBuffer: Uint8Array;
      let provingKey: Uint8Array;
      this.cancelToken.throwIfCancel();
      this.emit('stateChange', TransactionState.FetchingFixtures);

      const maxEdges = await anchor.inner.maxEdges();
      if (transferData.inputNotes.length > 2) {
        provingKey = await fetchVAnchorKeyFromAws(maxEdges, false, abortSignal);
        wasmBuffer = await fetchVAnchorWasmFromAws(maxEdges, false, abortSignal);
      } else {
        provingKey = await fetchVAnchorKeyFromAws(maxEdges, true, abortSignal);
        wasmBuffer = await fetchVAnchorWasmFromAws(maxEdges, true, abortSignal);
      }

      this.cancelToken.throwIfCancel();

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
        transferData.inputNotes.map((note) => this.fetchNoteLeaves(note, leavesMap, anchor, treeHeight))
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
      if (this.cancelToken.isCancelled()) {
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
      const changeKeypair = storedPrivateKey.keypair ? new Keypair(storedPrivateKey.keypair) : new Keypair();

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

      const outputUtxos = [changeUtxo, transferUtxo];

      this.emit('stateChange', TransactionState.GeneratingZk);
      const worker = this.inner.wasmFactory();
      const { extData, outputNotes, publicInputs } = await this.cancelToken.handleOrThrow(
        () =>
          anchor.setupTransaction(
            inputUtxos,
            [changeUtxo, transferUtxo],
            0, // the extAmount for a transfer should be zero
            0,
            0,
            activeBridge.currency.getAddress(sourceChainIdType)!,
            relayerAccount,
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
            toFixedHex(sourceChainIdType, 8).substring(2),
            toFixedHex(changeUtxo.amount).substring(2),
            toFixedHex(changeKeypair.privkey!).substring(2),
            toFixedHex(changeUtxo.blinding).substring(2),
          ].join(':'),
          sourceChain: sourceChainIdType.toString(),
          sourceIdentifyingData: srcAddress!,
          targetChain: sourceChainIdType.toString(),
          targetIdentifyingData: srcAddress!,
          tokenSymbol: (await Note.deserialize(transferData.inputNotes[0])).note.tokenSymbol,
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

        const parsedDestChainIdType = parseTypedChainId(sourceChainIdType);

        const chainInfo: RelayedChainInput = {
          baseOn: 'evm',
          contractAddress: srcAddress,
          endpoint: '',
          name: parsedDestChainIdType.chainId.toString(),
        };

        const extAmount = extData.extAmount.toString().replace('0x', '');
        const relayedDepositTxPayload = relayedVAnchorWithdraw.generateWithdrawRequest<typeof chainInfo, 'vAnchor'>(
          chainInfo,
          {
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
        for (const note of transferData.inputNotes) {
          const parsedNote = await Note.deserialize(note);
          this.inner.noteManager?.removeNote(parsedNote);
        }
      } else {
        const tx = await anchor.inner.transact(
          {
            ...publicInputs,
            outputCommitments: [publicInputs.outputCommitments[0], publicInputs.outputCommitments[1]],
          },
          extData
        );
        const receipt = await tx.wait();
        txHash = receipt.transactionHash;

        // Cleanup NoteAccount state
        for (const note of transferData.inputNotes) {
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
