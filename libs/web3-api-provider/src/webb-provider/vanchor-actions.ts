import {
  ActiveWebbRelayer,
  CancellationToken,
  isVAnchorDepositPayload,
  isVAnchorTransferPayload,
  isVAnchorWithdrawPayload,
  NewNotesTxResult,
  padHexString,
  ParametersOfTransactMethod,
  RelayedChainInput,
  RelayedWithdrawResult,
  Transaction,
  TransactionPayloadType,
  TransactionState,
  utxoFromVAnchorNote,
  VAnchorActions,
} from '@webb-tools/abstract-api-provider';
import { VAnchor } from '@webb-tools/anchors';
import {
  bridgeStorageFactory,
  registrationStorageFactory,
} from '@webb-tools/browser-utils/storage';
import { ERC20__factory, VAnchor__factory } from '@webb-tools/contracts';
import {
  checkNativeAddress,
  WebbError,
  WebbErrorCodes,
} from '@webb-tools/dapp-types';
import {
  ChainType,
  Keypair,
  MerkleTree,
  Note,
  ResourceId,
  toFixedHex,
  Utxo,
} from '@webb-tools/sdk-core';
import { FungibleTokenWrapper } from '@webb-tools/tokens';
import {
  hexToU8a,
  u8aToHex,
  ZERO_ADDRESS,
  ZERO_BYTES32,
} from '@webb-tools/utils';
import {
  BigNumber,
  ContractReceipt,
  ContractTransaction,
  Overrides,
} from 'ethers';

import { generateCircomCommitment } from '@webb-tools/abstract-api-provider';
import { Web3Provider } from '../ext-provider';
import { WebbWeb3Provider } from '../webb-provider';
import { ApiConfig } from '@webb-tools/dapp-config';

export class Web3VAnchorActions extends VAnchorActions<WebbWeb3Provider> {
  static async getNextIndex(
    apiConfig: ApiConfig,
    typedChainId: number,
    fungibleCurrencyId: number
  ): Promise<bigint> {
    const chain = apiConfig.chains[typedChainId];
    const anchor = apiConfig.getAnchorAddress(fungibleCurrencyId, typedChainId);
    if (!chain || !anchor) {
      throw WebbError.from(WebbErrorCodes.NoFungibleTokenAvailable);
    }

    const provider = Web3Provider.fromUri(chain.url).intoEthersProvider();
    const vanchor = VAnchor__factory.connect(anchor, provider);

    const nextIdx = await vanchor.getNextIndex();

    return BigInt(nextIdx);
  }

  async prepareTransaction(
    tx: Transaction<NewNotesTxResult>,
    payload: TransactionPayloadType,
    wrapUnwrapToken: string
  ): Promise<ParametersOfTransactMethod> | never {
    tx.next(TransactionState.PreparingTransaction, undefined);
    if (isVAnchorDepositPayload(payload)) {
      // Get the wrapped token and check the balance and approvals
      const tokenWrapper = await this.getTokenWrapper(payload);
      if (wrapUnwrapToken === '')
        wrapUnwrapToken = tokenWrapper.contract.address;

      await this.checkHasBalance(payload, wrapUnwrapToken);

      await this.checkApproval(tx, payload, wrapUnwrapToken, tokenWrapper);

      const secrets = payload.note.secrets.split(':');
      const depositUtxo = await this.inner.generateUtxo({
        curve: payload.note.curve,
        backend: payload.note.backend,
        amount: payload.note.amount,
        originChainId: payload.note.sourceChainId.toString(),
        chainId: payload.note.targetChainId.toString(),
        keypair: new Keypair(`0x${secrets[2]}`),
        blinding: hexToU8a(`0x${secrets[3]}`),
        index: this.inner.state.defaultUtxoIndex.toString(),
      });
      return Promise.resolve([
        tx, // tx
        payload.note.sourceIdentifyingData, // contractAddress
        [], // inputs
        [depositUtxo], // outputs
        BigNumber.from(0), // fee
        BigNumber.from(0), // refund
        ZERO_ADDRESS, // recipient
        ZERO_ADDRESS, // relayer
        wrapUnwrapToken, // wrapUnwrapToken
        {}, // leavesMap,
      ]);
    } else if (isVAnchorWithdrawPayload(payload)) {
      const { changeUtxo, notes, recipient, refundAmount, feeAmount } = payload;

      const { inputUtxos, leavesMap } = await this.commitmentsSetup(notes, tx);

      const relayer =
        this.inner.relayerManager.activeRelayer?.beneficiary ?? ZERO_ADDRESS;

      return Promise.resolve([
        tx, // tx
        notes[0].note.targetIdentifyingData, // contractAddress
        inputUtxos, // inputs
        [changeUtxo], // outputs
        BigNumber.from(feeAmount), // fee
        BigNumber.from(refundAmount), // refund
        recipient, // recipient
        relayer, // relayer
        wrapUnwrapToken, // wrapUnwrapToken
        leavesMap, // leavesMap
      ]);
    } else if (isVAnchorTransferPayload(payload)) {
      const { changeUtxo, transferUtxo, notes, feeAmount } = payload;

      const { inputUtxos, leavesMap } = await this.commitmentsSetup(notes, tx);

      const relayer =
        this.inner.relayerManager.activeRelayer?.beneficiary ?? ZERO_ADDRESS;

      // If no relayer is set, then the fee is 0, otherwise it is the fee amount
      const feeVal = relayer === ZERO_ADDRESS ? BigNumber.from(0) : feeAmount;

      // set the anchor to make the transfer on (where the notes are being spent for the transfer)
      return Promise.resolve([
        tx, // tx
        notes[0].note.targetIdentifyingData, // contractAddress
        inputUtxos, // inputs
        [changeUtxo, transferUtxo], // outputs
        feeVal, // fee
        BigNumber.from(0), // refund
        ZERO_ADDRESS, // recipient
        relayer, // relayer
        '', // wrapUnwrapToken (not used for transfers)
        leavesMap, // leavesMap
      ]);
    } else {
      // Handle by outer try/catch
      throw new Error('Invalid payload');
    }
  }

  async transactWithRelayer(
    activeRelayer: ActiveWebbRelayer,
    txArgs: ParametersOfTransactMethod,
    changeNotes: Note[]
  ): Promise<void> | never {
    let txHash = '';

    const [tx, contractAddress, rawInputUtxos, rawOutputUtxos, ...restArgs] =
      txArgs;

    const relayedVAnchorWithdraw = await activeRelayer.initWithdraw('vAnchor');

    const vanchor = await this.inner.getVariableAnchorByAddress(
      contractAddress
    );

    const chainId = await vanchor.contract.getChainId();

    const chainInfo: RelayedChainInput = {
      baseOn: 'evm',
      contractAddress: contractAddress,
      endpoint: '',
      name: chainId.toString(),
    };

    // Pad the input & output utxo
    const inputUtxos = await vanchor.padUtxos(rawInputUtxos, 16); // 16 is the require number of inputs (for 8-sided bridge)
    const outputUtxos = await vanchor.padUtxos(rawOutputUtxos, 2); // 2 is the require number of outputs (for 8-sided bridge)

    const setupTransactionArgs = [
      inputUtxos,
      outputUtxos,
      ...(restArgs.length === 6 ? restArgs : restArgs.slice(0, -1)),
    ] as Parameters<typeof vanchor.setupTransaction>;

    const { extAmount, extData, publicInputs } = await vanchor.setupTransaction(
      ...setupTransactionArgs
    );

    const relayedDepositTxPayload =
      relayedVAnchorWithdraw.generateWithdrawRequest<
        typeof chainInfo,
        'vAnchor'
      >(chainInfo, {
        chainId: chainId.toNumber(),
        id: contractAddress,
        extData: {
          recipient: extData.recipient,
          relayer: extData.relayer,
          extAmount: extAmount.toHexString().replace('0x', ''),
          fee: extData.fee,
          encryptedOutput1: extData.encryptedOutput1,
          encryptedOutput2: extData.encryptedOutput2,
          refund: extData.refund,
          token: extData.token,
        },
        proofData: {
          proof: publicInputs.proof,
          extensionRoots: publicInputs.extensionRoots,
          extDataHash: padHexString(publicInputs.extDataHash.toHexString()),
          publicAmount: publicInputs.publicAmount,
          roots: publicInputs.roots,
          outputCommitments: publicInputs.outputCommitments.map((output) =>
            padHexString(output.toHexString())
          ),
          inputNullifiers: publicInputs.inputNullifiers.map((nullifier) =>
            padHexString(nullifier.toHexString())
          ),
        },
      });

    // Subscribe to the relayer's transaction status.
    relayedVAnchorWithdraw.watcher.subscribe(([results, message]) => {
      switch (results) {
        case RelayedWithdrawResult.PreFlight:
          tx.next(TransactionState.SendingTransaction, '');
          break;
        case RelayedWithdrawResult.OnFlight:
          break;
        case RelayedWithdrawResult.Continue:
          break;
        case RelayedWithdrawResult.CleanExit:
          tx.next(TransactionState.Done, {
            txHash,
            outputNotes: changeNotes,
          });
          break;
        case RelayedWithdrawResult.Errored: {
          changeNotes.forEach((note) =>
            this.inner.noteManager?.removeNote(note)
          );
          tx.fail(message ? message : 'Transaction failed');
          break;
        }
      }
    });

    tx.next(TransactionState.Intermediate, {
      name: 'Sending TX to relayer',
    });

    // Send the transaction to the relayer.
    relayedVAnchorWithdraw.send(relayedDepositTxPayload);
    const results = await relayedVAnchorWithdraw.await();
    if (results) {
      const [, message] = results;
      txHash = message ?? '';
      tx.txHash = txHash;
    }
  }

  async transact(
    tx: Transaction<NewNotesTxResult>,
    contractAddress: string,
    inputs: Utxo[],
    outputs: Utxo[],
    fee: BigNumber,
    refund: BigNumber,
    recipient: string,
    relayer: string,
    wrapUnwrapToken: string,
    leavesMap: Record<string, Uint8Array[]>,
    overridesTransaction?: Overrides
  ) {
    const signer = await this.inner.getProvider().getSigner();
    const maxEdges = await this.inner.getVAnchorMaxEdges(contractAddress);

    const vanchor = await VAnchor.connect(
      contractAddress,
      await this.inner.getZkFixtures(maxEdges, true),
      await this.inner.getZkFixtures(maxEdges, false),
      signer
    );

    tx.txHash = '';
    tx.next(TransactionState.SendingTransaction, '');

    const receipt = await vanchor.transact(
      inputs,
      outputs,
      fee,
      refund,
      recipient,
      relayer,
      wrapUnwrapToken,
      leavesMap,
      overridesTransaction
    );

    return {
      transactionHash: receipt.transactionHash,
      receipt: receipt,
    };
  }

  // Check if the evm address and keyData pairing has already registered.
  async isPairRegistered(
    anchorAddress: string,
    account: string,
    keyData: string
  ): Promise<boolean> {
    // Check the localStorage for now.
    // TODO: Implement a query on relayers?
    const registration = await registrationStorageFactory(account);
    const registeredKeydatas = await registration.get(anchorAddress);
    if (
      registeredKeydatas &&
      registeredKeydatas.find((entry) => entry === keyData) != undefined
    ) {
      return true;
    }
    return false;
  }

  async register(
    anchorAddress: string,
    account: string,
    keyData: string
  ): Promise<boolean> {
    const vanchor = await this.inner.getVariableAnchorByAddress(anchorAddress);
    this.inner.notificationHandler({
      description: 'Registering Account',
      key: 'register',
      level: 'loading',
      message: 'Registering Account',
      name: 'Transaction',
    });

    try {
      // The user may reject on-chain registration
      await vanchor.register(account, keyData);
    } catch (ex) {
      this.inner.notificationHandler({
        description: 'Account Registration Failed',
        key: 'register',
        level: 'error',
        message: 'Account Registration Failed',
        name: 'Transaction',
      });
      return false;
    }

    this.inner.notificationHandler({
      description: 'Account Registered',
      key: 'register',
      level: 'success',
      message: 'Account Registered',
      name: 'Transaction',
    });

    const registration = await registrationStorageFactory(account);
    let registeredPubkeys = await registration.get(anchorAddress);

    // If there is already a registration localstorage, append.
    if (registeredPubkeys) {
      registeredPubkeys.push(keyData);
    } else {
      registeredPubkeys = [keyData];
    }
    await registration.set(anchorAddress, registeredPubkeys);

    return true;
  }

  async syncNotesForKeypair(
    anchorAddress: string,
    owner: Keypair
  ): Promise<Note[]> {
    const cancelToken = new CancellationToken();
    const vanchor = await this.inner.getVariableAnchorByAddress(anchorAddress);
    const notes = await this.inner.getVAnchorNotesFromChain(
      vanchor,
      owner,
      cancelToken.abortSignal
    );
    return notes;
  }

  async getGasAmount(
    vAnchorAddress: string,
    option: {
      inputs: Utxo[];
      outputs: Utxo[];
      fee: BigNumber;
      refund: BigNumber;
      recipient: string;
      relayer: string;
      wrapUnwrapToken: string;
      leavesMap: Record<string, Uint8Array[]>;
    }
  ): Promise<BigNumber> | never {
    const vanchor = await this.inner.getVariableAnchorByAddress(vAnchorAddress);

    const { publicInputs, extData, extAmount } = await vanchor.setupTransaction(
      await vanchor.padUtxos(option.inputs, 16), // 16 is the max number of inputs
      await vanchor.padUtxos(option.outputs, 2), // 2 is the max number of outputs
      option.fee,
      option.refund,
      option.recipient,
      option.relayer,
      option.wrapUnwrapToken,
      option.leavesMap
    );

    const options = await vanchor.getWrapUnwrapOptions(
      extAmount,
      option.refund,
      option.wrapUnwrapToken
    );

    return vanchor.contract.estimateGas.transact(
      publicInputs.proof,
      ZERO_BYTES32,
      extData,
      publicInputs,
      extData,
      options
    );
  }

  async commitmentsSetup(notes: Note[], tx?: Transaction<NewNotesTxResult>) {
    if (notes.length === 0) {
      throw new Error('No notes to deposit');
    }

    const payload = notes[0];
    const destVAnchor = await this.getVAnchor(payload, true);
    const treeHeight = await destVAnchor.contract.getLevels();

    // Loop through the notes and populate the leaves map
    const leavesMap: Record<string, Uint8Array[]> = {};

    const notesLeaves = await Promise.all(
      notes.map((note) =>
        this.fetchNoteLeaves(note, leavesMap, destVAnchor, treeHeight, tx)
      )
    );

    // Keep track of the leafindices for each note
    const leafIndices: number[] = [];

    // Create input UTXOs for convenience calculations
    const inputUtxos: Utxo[] = [];

    // calculate the sum of input notes (for calculating the change utxo)
    let sumInputNotes: BigNumber = BigNumber.from(0);

    notesLeaves.forEach(({ amount, leafIndex, utxo }) => {
      sumInputNotes = sumInputNotes.add(amount);
      leafIndices.push(leafIndex);
      inputUtxos.push(utxo);
    });

    const destTypedChainId = payload.note.targetChainId;
    // Populate the leaves for the destination if not already populated
    if (!leavesMap[destTypedChainId.toString()]) {
      const chainId = await destVAnchor.contract.getChainId();
      const resourceId = ResourceId.newFromContractAddress(
        destVAnchor.contract.address,
        ChainType.EVM,
        chainId.toNumber()
      );
      const leafStorage = await bridgeStorageFactory(resourceId.toString());
      const leaves = await this.inner.getVariableAnchorLeaves(
        destVAnchor,
        leafStorage,
        tx?.cancelToken.abortSignal
      );

      leavesMap[destTypedChainId.toString()] = leaves.map((leaf) => {
        return hexToU8a(leaf);
      });
    }

    return {
      sumInputNotes,
      inputUtxos,
      leavesMap,
    };
  }

  /**
   * A function to get the leaf index of a leaf in the vanchor
   * @param receipt the receipt of the transaction that created the note
   * @param note the deposit note
   * @param addressOrTreeId the address of the vanchor or the treeId of the vanchor
   */
  async getLeafIndex(
    receipt: ContractReceipt,
    note: Note,
    addressOrTreeId: string
  ): Promise<bigint> {
    const typedChainId = this.inner.typedChainId;
    const chain = this.inner.config.chains[typedChainId];
    if (!chain) {
      throw WebbError.from(WebbErrorCodes.UnsupportedChain);
    }

    const vanchor = VAnchor__factory.connect(
      addressOrTreeId,
      Web3Provider.fromUri(chain.url).intoEthersProvider()
    );

    // Get fragment and topic of the `NewCommitment` event.
    const eventFragment = vanchor.interface.getEvent('NewCommitment');
    const topic = vanchor.interface.getEventTopic(eventFragment);

    // Filter the logs for the event
    const filteredLogs = receipt.logs.filter((log) =>
      log.topics.includes(topic)
    );

    // Parse the log data
    const parsedEvents = filteredLogs
      .map((log) => {
        const decodedValues = vanchor.interface.decodeEventLog(
          eventFragment,
          log.data,
          log.topics
        );
        return decodedValues;
      })
      .map((val) => ({
        leafIndex: BigNumber.from(val.leafIndex),
        commitment: BigNumber.from(val.commitment),
      }));

    // Get the leaf index of the note
    const depositedCommitment = generateCircomCommitment(note.note).toString();
    const event = parsedEvents.find((value) =>
      value.commitment.eq(depositedCommitment)
    );

    if (!event) {
      console.error('Leaf index not found in logs, falling back `0`');
      return BigInt(0);
    }

    return event.leafIndex.toBigInt();
  }

  async getNextIndex(
    typedChainId: number,
    fungibleCurrencyId: number
  ): Promise<bigint> {
    const chain = this.inner.config.chains[typedChainId];
    const anchor = this.inner.config.getAnchorAddress(
      fungibleCurrencyId,
      typedChainId
    );
    if (!chain || !anchor) {
      throw WebbError.from(WebbErrorCodes.NoFungibleTokenAvailable);
    }

    const provider = Web3Provider.fromUri(chain.url).intoEthersProvider();
    const vanchor = VAnchor__factory.connect(anchor, provider);

    const nextIdx = await vanchor.getNextIndex();

    return BigInt(nextIdx);
  }

  private async fetchNoteLeaves(
    note: Note,
    leavesMap: Record<string, Uint8Array[]>,
    destVAnchor: VAnchor,
    treeHeight: number,
    tx?: Transaction<NewNotesTxResult>
  ): Promise<{ leafIndex: number; utxo: Utxo; amount: BigNumber }> | never {
    if (tx) {
      tx.next(TransactionState.FetchingLeaves, {
        end: undefined,
        currentRange: [0, 1],
        start: 0,
      });
    }

    const parsedNote = note.note;
    const amount = BigNumber.from(parsedNote.amount);

    // fetch leaves if we don't have them
    if (leavesMap[parsedNote.sourceChainId] === undefined) {
      // Set up a provider for the source chain
      const sourceChainConfig =
        this.inner.config.chains[Number(parsedNote.sourceChainId)];
      const sourceHttpProvider = Web3Provider.fromUri(sourceChainConfig.url);
      const sourceAddress = parsedNote.sourceIdentifyingData;
      const sourceEthers = sourceHttpProvider.intoEthersProvider();

      const sourceVAnchor =
        await this.inner.getVariableAnchorByAddressAndProvider(
          sourceAddress,
          sourceEthers
        );

      const chainId = await sourceVAnchor.contract.getChainId();
      const resourceId = ResourceId.newFromContractAddress(
        sourceVAnchor.contract.address,
        ChainType.EVM,
        chainId.toNumber()
      );
      const leafStorage = await bridgeStorageFactory(resourceId.toString());
      const leaves = await this.inner.getVariableAnchorLeaves(
        sourceVAnchor,
        leafStorage,
        tx?.cancelToken.abortSignal
      );
      leavesMap[parsedNote.sourceChainId] = leaves.map((leaf) => {
        return hexToU8a(leaf);
      });
    }

    let destHistorySourceRoot: string;

    // Get the latest root that has been relayed from the source chain to the destination chain
    if (parsedNote.sourceChainId === parsedNote.targetChainId) {
      const destRoot = await destVAnchor.contract.getLastRoot();
      destHistorySourceRoot = destRoot.toHexString();
    } else {
      const edgeIndex = await destVAnchor.contract.edgeIndex(
        parsedNote.sourceChainId
      );
      const edge = await destVAnchor.contract.edgeList(edgeIndex);
      destHistorySourceRoot = edge[1].toHexString();
    }

    // Fixed the root to be 32 bytes
    destHistorySourceRoot = toFixedHex(destHistorySourceRoot);

    // Remove leaves from the leaves map which have not yet been relayed
    const provingTree = MerkleTree.createTreeWithRoot(
      treeHeight,
      leavesMap[parsedNote.sourceChainId].map((leaf) => u8aToHex(leaf)),
      destHistorySourceRoot
    );

    if (!provingTree) {
      // Outer try/catch will handle this
      throw new Error('Fetched leaves do not match bridged anchor state');
    }

    const provingLeaves = provingTree
      .elements()
      .map((el) => hexToU8a(el.toHexString()));
    leavesMap[parsedNote.sourceChainId] = provingLeaves;
    const commitment = generateCircomCommitment(parsedNote);
    const leafIndex = provingTree.getIndexByElement(commitment);
    // Validate that the commitment is in the tree
    if (leafIndex === -1) {
      // Outer try/catch will handle this
      throw new Error(
        'Commitment not found in tree, maybe waiting for relaying'
      );
    }

    const utxo = await utxoFromVAnchorNote(parsedNote, leafIndex);

    return {
      leafIndex,
      utxo,
      amount,
    };
  }

  private async getVAnchor(
    payload: Note,
    isDestAnchor = false
  ): Promise<VAnchor> | never {
    const { note } = payload;
    const { sourceChainId, targetChainId } = note;
    const vanchors = await this.inner.methods.bridgeApi.getVAnchors();

    if (vanchors.length === 0) {
      throw new Error('No variable anchor configured for selected token');
    }

    const vanchor = vanchors[0];

    // Get the contract address for the src chain
    let vanchorAddress: string;

    if (isDestAnchor) {
      vanchorAddress = vanchor.neighbours[+targetChainId] as string;
    } else {
      vanchorAddress = vanchor.neighbours[+sourceChainId] as string;
    }

    if (!vanchorAddress) {
      throw new Error(`No Anchor for the chain ${note.targetChainId}`);
    }

    return await this.inner.getVariableAnchorByAddress(vanchorAddress);
  }

  private async getTokenWrapper(
    payload: Note,
    isDest = false
  ): Promise<FungibleTokenWrapper> {
    const vAnchor = await this.getVAnchor(payload, isDest);
    const currentWebbToken = await vAnchor.contract.token();
    return FungibleTokenWrapper.connect(
      currentWebbToken,
      this.inner.getEthersProvider().getSigner()
    );
  }

  private async checkHasBalance(
    payload: Note,
    wrapUnwrapToken: string
  ): Promise<void> | never {
    const provider = this.inner.getEthersProvider();
    const signer = await provider.getSigner().getAddress();
    // Checking for balance of the wrapUnwrapToken
    let hasBalance: boolean;
    // If the `wrapUnwrapToken` is the `ZERO_ADDRESS`, we are wrapping
    // the native token. Therefore, we must check the native balance.
    if (checkNativeAddress(wrapUnwrapToken)) {
      const nativeBalance = await provider.getBalance(signer);
      hasBalance = nativeBalance.gte(payload.note.amount);
    } else {
      // If the `wrapUnwrapToken` is not the `ZERO_ADDRESS`, we assume that
      // the `wrapUnwrapToken` has been set to either the wrappedToken address
      // of the address of a wrappable ERC20 token. In either case, we can check the
      // balance using the `ERC20` contract.
      const erc20 = ERC20__factory.connect(wrapUnwrapToken, provider);
      const balance = await erc20.balanceOf(signer);
      console.log('Balance: ', balance);
      hasBalance = balance.gte(payload.note.amount);
    }
    // Notification failed transaction if not enough balance
    if (!hasBalance) {
      this.emit('stateChange', TransactionState.Failed);
      await this.inner.noteManager?.removeNote(payload);
      throw new Error('Not enough balance');
    }
  }

  private async checkApproval(
    tx: Transaction<NewNotesTxResult>,
    payload: Note,
    wrapUnwrapToken: string,
    tokenWrapper: FungibleTokenWrapper
  ): Promise<void> | never {
    const { note } = payload;
    const { amount } = note;

    const srcVAnchor = await this.getVAnchor(payload);
    const spenderAddress = srcVAnchor.contract.address;
    const currentWebbToken = await srcVAnchor.getWebbToken();

    const approvalValue = await tokenWrapper.contract.getAmountToWrap(amount);
    let approvalTransaction: ContractTransaction | undefined;

    const isNative = checkNativeAddress(wrapUnwrapToken);

    // If the `wrapUnwrapToken` is different from the `currentWebbToken` address,
    // we are wrapping / unwrapping. otherwise, we are depositing / withdrawing.
    const isWrapOrUnwrap = wrapUnwrapToken !== currentWebbToken.address;

    // Only non-native tokens require approval
    if (!isNative) {
      const isRequiredApproval = !isWrapOrUnwrap
        ? await srcVAnchor.isWebbTokenApprovalRequired(amount)
        : await srcVAnchor.isWrappableTokenApprovalRequired(
            wrapUnwrapToken,
            approvalValue
          );

      if (isRequiredApproval) {
        if (isWrapOrUnwrap) {
          // approve the wrappable asset
          const token = ERC20__factory.connect(
            wrapUnwrapToken,
            this.inner.getEthersProvider().getSigner()
          );
          approvalTransaction = await token.approve(
            spenderAddress,
            approvalValue,
            {
              gasLimit: '0x5B8D80',
            }
          );
        } else {
          // approve the token
          approvalTransaction = await currentWebbToken.approve(
            spenderAddress,
            amount,
            {
              gasLimit: '0x5B8D80',
            }
          );
        }
      }
    }

    if (approvalTransaction) {
      // Notification Waiting for approval notification
      tx.next(TransactionState.Intermediate, {
        name: 'Approval is required for depositing',
        data: {
          tokenAddress: wrapUnwrapToken,
        },
      });

      await approvalTransaction.wait();
      tx.next(TransactionState.Intermediate, {
        name: 'Approved',
        data: {
          txHash: approvalTransaction.hash,
        },
      });
    }
  }
}
