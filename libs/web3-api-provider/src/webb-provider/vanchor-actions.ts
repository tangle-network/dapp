import {
  ActiveWebbRelayer,
  calculateProvingLeavesAndCommitmentIndex,
  generateCircomCommitment,
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
import {
  bridgeStorageFactory,
  registrationStorageFactory,
} from '@webb-tools/browser-utils/storage';
import {
  ERC20__factory,
  FungibleTokenWrapper__factory,
  VAnchor__factory,
} from '@webb-tools/contracts';
import { ApiConfig, ensureHex, ZERO_BIG_INT } from '@webb-tools/dapp-config';
import gasLimitConfig from '@webb-tools/dapp-config/gasLimitConfig';
import {
  checkNativeAddress,
  WebbError,
  WebbErrorCodes,
} from '@webb-tools/dapp-types';
import {
  ChainType,
  Keypair,
  Note,
  parseTypedChainId,
  ResourceId,
  toFixedHex,
  Utxo,
} from '@webb-tools/sdk-core';
import {
  hexToU8a,
  u8aToHex,
  ZERO_ADDRESS,
  ZERO_BYTES32,
} from '@webb-tools/utils';
import {
  Address,
  getContract,
  GetContractReturnType,
  Hash,
  PublicClient,
} from 'viem';
import { getPublicClient } from 'wagmi/actions';
import { handleVAnchorTxState } from '../utils';
import { WebbWeb3Provider } from '../webb-provider';

export class Web3VAnchorActions extends VAnchorActions<
  'web3',
  WebbWeb3Provider
> {
  static async getNextIndex(
    apiConfig: ApiConfig,
    typedChainId: number,
    fungibleCurrencyId: number
  ): Promise<bigint> {
    const { chainId } = parseTypedChainId(typedChainId);

    const anchor = apiConfig.getAnchorIdentifier(
      fungibleCurrencyId,
      typedChainId
    );
    if (!anchor) {
      throw WebbError.from(WebbErrorCodes.NoFungibleTokenAvailable);
    }

    const vAnchorContract = getContract({
      abi: VAnchor__factory.abi,
      address: ensureHex(anchor),
      publicClient: getPublicClient({ chainId: chainId }),
    });

    const nextIdx = await vAnchorContract.read.getNextIndex();

    return BigInt(nextIdx);
  }

  async prepareTransaction(
    tx: Transaction<NewNotesTxResult>,
    payload: TransactionPayloadType,
    wrapUnwrapToken: string
  ): Promise<ParametersOfTransactMethod<'web3'>> | never {
    tx.next(TransactionState.PreparingTransaction, undefined);

    if (isVAnchorDepositPayload(payload)) {
      // Get the wrapped token and check the balance and approvals
      const tokenWrapper = await this.getTokenWrapperContract(payload);
      if (wrapUnwrapToken === '') wrapUnwrapToken = tokenWrapper.address;

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
        ensureHex(payload.note.sourceIdentifyingData), // contractAddress
        [], // inputs
        [depositUtxo], // outputs
        ZERO_BIG_INT, // fee
        ZERO_BIG_INT, // refund
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

      // If no relayer is set, then the fee is 0, otherwise it is the fee amount
      const feeVal = relayer === ZERO_ADDRESS ? ZERO_BIG_INT : feeAmount;

      return Promise.resolve([
        tx, // tx
        ensureHex(notes[0].note.targetIdentifyingData), // contractAddress
        inputUtxos, // inputs
        [changeUtxo], // outputs
        feeVal, // fee
        refundAmount, // refund
        ensureHex(recipient), // recipient
        ensureHex(relayer), // relayer
        wrapUnwrapToken, // wrapUnwrapToken
        leavesMap, // leavesMap
      ]);
    } else if (isVAnchorTransferPayload(payload)) {
      const { changeUtxo, transferUtxo, notes, feeAmount } = payload;

      const { inputUtxos, leavesMap } = await this.commitmentsSetup(notes, tx);

      const relayer =
        this.inner.relayerManager.activeRelayer?.beneficiary ?? ZERO_ADDRESS;

      // If no relayer is set, then the fee is 0, otherwise it is the fee amount
      const feeVal = relayer === ZERO_ADDRESS ? ZERO_BIG_INT : feeAmount;

      // set the anchor to make the transfer on (where the notes are being spent for the transfer)
      return Promise.resolve([
        tx, // tx
        ensureHex(notes[0].note.targetIdentifyingData), // contractAddress
        inputUtxos, // inputs
        [changeUtxo, transferUtxo], // outputs
        feeVal, // fee
        ZERO_BIG_INT, // refund
        ZERO_ADDRESS, // recipient
        ensureHex(relayer), // relayer
        '', // wrapUnwrapToken (not used for transfers)
        leavesMap, // leavesMap,
      ]);
    } else {
      // Handle by outer try/catch
      throw new Error('Invalid payload');
    }
  }

  async transactWithRelayer(
    activeRelayer: ActiveWebbRelayer,
    txArgs: ParametersOfTransactMethod<'web3'>,
    changeNotes: Note[]
  ): Promise<void> | never {
    let txHash = '';

    const [tx, contractAddress, rawInputUtxos, rawOutputUtxos, ...restArgs] =
      txArgs;

    const relayedVAnchorWithdraw = await activeRelayer.initWithdraw('vAnchor');

    const vAnchorContract =
      this.inner.getVAnchorContractByAddress(contractAddress);

    const chainId = await vAnchorContract.read.getChainId();

    const chainInfo: RelayedChainInput = {
      baseOn: 'evm',
      contractAddress: contractAddress,
      endpoint: '',
      name: chainId.toString(),
    };

    const vAnchor = await this.inner.getVAnchorInstance(
      contractAddress,
      this.inner.publicClient
    );

    // Pad the input & output utxo
    const inputUtxos = await vAnchor.padUtxos(rawInputUtxos, 16); // 16 is the require number of inputs (for 8-sided bridge)
    const outputUtxos = await vAnchor.padUtxos(rawOutputUtxos, 2); // 2 is the require number of outputs (for 8-sided bridge)

    const { extAmount, extData, publicInputs } = await vAnchor.setupTransaction(
      inputUtxos,
      [outputUtxos[0], outputUtxos[1]],
      ...restArgs
    );

    const relayedDepositTxPayload =
      relayedVAnchorWithdraw.generateWithdrawRequest<
        typeof chainInfo,
        'vAnchor'
      >(chainInfo, {
        chainId: +chainId.toString(),
        id: contractAddress,
        extData: {
          recipient: extData.recipient,
          relayer: extData.relayer,
          extAmount: toFixedHex(extAmount).replace('0x', ''),
          fee: toFixedHex(extData.fee),
          refund: toFixedHex(extData.refund),
          token: extData.token,
          encryptedOutput1: extData.encryptedOutput1,
          encryptedOutput2: extData.encryptedOutput2,
        },
        proofData: {
          proof: publicInputs.proof,
          extensionRoots: publicInputs.extensionRoots,
          extDataHash: toFixedHex(publicInputs.extDataHash),
          publicAmount: publicInputs.publicAmount,
          roots: publicInputs.roots,
          outputCommitments: publicInputs.outputCommitments.map((output) =>
            padHexString(ensureHex(output.toString(16)))
          ),
          inputNullifiers: publicInputs.inputNullifiers.map((nullifier) =>
            padHexString(ensureHex(nullifier.toString(16)))
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
          changeNotes.forEach(async (note) => {
            const { chainId, chainType } = parseTypedChainId(
              +note.note.targetChainId
            );

            const resourceId =
              await this.inner.methods.variableAnchor.actions.inner.getResourceId(
                note.note.targetIdentifyingData,
                chainId,
                chainType
              );

            this.inner.noteManager?.removeNote(resourceId, note);
          });
          tx.fail(message ? message : 'Transaction failed');
          break;
        }
      }
    });

    tx.next(TransactionState.Intermediate, {
      name: 'Sending TX to relayer',
    });

    // Send the transaction to the relayer.
    relayedVAnchorWithdraw.send(relayedDepositTxPayload, +`${chainId}`);
    const results = await relayedVAnchorWithdraw.await();
    if (results) {
      const [, message] = results;
      txHash = message ?? '';
      tx.txHash = txHash;
    }
  }

  async transact(
    tx: Transaction<NewNotesTxResult>,
    contractAddress: Address,
    inputs: Utxo[],
    outputs: Utxo[],
    fee: bigint,
    refund: bigint,
    recipient: Address,
    relayer: Address,
    wrapUnwrapToken: Address,
    leavesMap: Record<string, Uint8Array[]>
  ) {
    const vAnchor = await this.inner.getVAnchorInstance(
      contractAddress,
      this.inner.publicClient
    );

    tx.txHash = '';
    tx.next(TransactionState.SendingTransaction, '');

    const typedChainId = this.inner.typedChainId;
    const gasLimit = gasLimitConfig[typedChainId] ?? gasLimitConfig.default;

    const hash = await vAnchor.transact(
      inputs,
      outputs,
      fee,
      refund,
      recipient,
      relayer,
      wrapUnwrapToken,
      leavesMap,
      {
        gas: gasLimit,
        walletClient: this.inner.walletClient,
        onTransactionState(state, payload) {
          handleVAnchorTxState(tx, state, payload);
        },
      }
    );

    tx.txHash = hash;

    // Wait for the transaction to be finalized.
    await this.inner.publicClient.waitForTransactionReceipt({ hash });

    return hash;
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
    account: Address,
    keyData: Address
  ): Promise<boolean> {
    const vAnchorContract =
      this.inner.getVAnchorContractByAddress(anchorAddress);

    this.inner.notificationHandler({
      description: 'Registering Account',
      key: 'register',
      level: 'loading',
      message: 'Registering Account',
      name: 'Transaction',
    });

    try {
      const { request } = await vAnchorContract.simulate.register([
        { owner: account, keyData },
      ]);

      await this.inner.walletClient.sendTransaction(request);
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
    const vAnchorContract =
      this.inner.getVAnchorContractByAddress(anchorAddress);

    const notes = await this.inner.getVAnchorNotesFromChain(
      vAnchorContract,
      owner
    );

    return notes;
  }

  async getGasAmount(
    vAnchorAddress: string,
    option: {
      inputs: Utxo[];
      outputs: Utxo[];
      fee: bigint;
      refund: bigint;
      recipient: Address;
      relayer: Address;
      wrapUnwrapToken: string;
      leavesMap: Record<string, Uint8Array[]>;
    }
  ): Promise<bigint> | never {
    const account = this.inner.walletClient.account;
    if (!account) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }

    const vAnchorInstance = await this.inner.getVAnchorInstance(
      vAnchorAddress,
      this.inner.publicClient
    );

    const inUtxos = await vAnchorInstance.padUtxos(option.inputs, 16); // 16 is the max number of inputs
    const [outUtxo1, outUtxo2] = await vAnchorInstance.padUtxos(
      option.outputs,
      2
    ); // 2 is the max number of outputs

    const { publicInputs, extData, extAmount } =
      await vAnchorInstance.setupTransaction(
        inUtxos,
        [outUtxo1, outUtxo2],
        option.fee,
        option.refund,
        option.recipient,
        option.relayer,
        option.wrapUnwrapToken,
        option.leavesMap
      );

    const options = await vAnchorInstance.getWrapUnwrapOptions(
      extAmount,
      option.refund,
      option.wrapUnwrapToken
    );

    return vAnchorInstance.contract.estimateGas.transact(
      [
        publicInputs.proof,
        ZERO_BYTES32,
        extData,
        { ...publicInputs, publicAmount: BigInt(publicInputs.publicAmount) },
        extData,
      ],
      {
        account,
        value: options.value ?? ZERO_BIG_INT,
      }
    );
  }

  async commitmentsSetup(notes: Note[], tx?: Transaction<NewNotesTxResult>) {
    if (notes.length === 0) {
      throw new Error('No notes to deposit');
    }

    const payload = notes[0];
    const destVAnchor = await this.getVAnchor(payload, true);
    const treeHeight = await destVAnchor.read.getLevels();

    // Loop through the notes and populate the leaves map
    const leavesMap: Record<string, Uint8Array[]> = {};

    const notesLeaves: Array<
      Awaited<ReturnType<Web3VAnchorActions['fetchNoteLeaves']>>
    > = [];

    // Fetch the leaves for each note in sequencial order
    // because if we fetch them in parallel, if one of the
    // task fails, others will still be running and resolve.
    // That makes the UI to show the wrong state.
    for (const note of notes) {
      const noteLeaves = await this.fetchNoteLeaves(
        note,
        leavesMap,
        destVAnchor,
        treeHeight,
        tx
      );

      notesLeaves.push(noteLeaves);
    }

    // Keep track of the leafindices for each note
    const leafIndices: number[] = [];

    // Create input UTXOs for convenience calculations
    const inputUtxos: Utxo[] = [];

    // calculate the sum of input notes (for calculating the change utxo)
    let sumInputNotes: bigint = ZERO_BIG_INT;

    notesLeaves.forEach(({ amount, leafIndex, utxo }) => {
      sumInputNotes += BigInt(amount);
      leafIndices.push(leafIndex);
      inputUtxos.push(utxo);
    });

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
    txHash: Hash,
    note: Note,
    _: number, // Ignore the index before insertion
    addressOrTreeId: string
  ): Promise<bigint> {
    const typedChainId = this.inner.typedChainId;
    const chain = this.inner.config.chains[typedChainId];
    if (!chain) {
      throw WebbError.from(WebbErrorCodes.UnsupportedChain);
    }

    const receipt = await this.inner.publicClient.getTransactionReceipt({
      hash: txHash,
    });

    const logs = await this.inner.getNewCommitmentLogs(
      this.inner.publicClient,
      getContract({
        address: ensureHex(addressOrTreeId),
        abi: VAnchor__factory.abi,
        publicClient: this.inner.publicClient,
      }),
      receipt.blockNumber,
      receipt.blockNumber
    );

    // Get the leaf index of the note
    const depositedCommitment = generateCircomCommitment(note.note);
    const log = logs.find((log) => log.args.commitment === depositedCommitment);
    if (!log) {
      console.error(
        `Leaf index not found in log ${log}, falling back to \`${ZERO_BIG_INT}\``
      );
      return ZERO_BIG_INT;
    }

    return log.args.leafIndex;
  }

  async getNextIndex(
    typedChainId: number,
    fungibleCurrencyId: number
  ): Promise<bigint> {
    const chain = this.inner.config.chains[typedChainId];
    const anchor = this.inner.config.getAnchorIdentifier(
      fungibleCurrencyId,
      typedChainId
    );
    if (!chain || !anchor) {
      throw WebbError.from(WebbErrorCodes.NoFungibleTokenAvailable);
    }

    const publicClient = getPublicClient({ chainId: chain.id });

    const vAnchorContract = getContract({
      abi: VAnchor__factory.abi,
      address: ensureHex(anchor),
      publicClient,
    });

    const nextIdx = await vAnchorContract.read.getNextIndex();

    return BigInt(nextIdx);
  }

  async getResourceId(
    anchorAddress: string,
    chainId: number,
    chainType: ChainType
  ): Promise<ResourceId> {
    return new ResourceId(anchorAddress, chainType, chainId);
  }

  // ================== PRIVATE METHODS ===================

  private async fetchNoteLeaves(
    note: Note,
    leavesMap: Record<string, Uint8Array[]>,
    destVAnchor: GetContractReturnType<
      typeof VAnchor__factory.abi,
      PublicClient
    >,
    treeHeight: number,
    tx?: Transaction<NewNotesTxResult>
  ): Promise<{ leafIndex: number; utxo: Utxo; amount: bigint }> | never {
    if (tx) {
      // Fetching leaves from relayer initially
      tx.next(TransactionState.FetchingLeavesFromRelayer, undefined);
    }

    const parsedNote = note.note;
    const amount = BigInt(parsedNote.amount);

    let destRelayedRootBI: bigint;

    // Get the latest root that has been relayed from the source chain to the destination chain
    if (parsedNote.sourceChainId === parsedNote.targetChainId) {
      destRelayedRootBI = await destVAnchor.read.getLastRoot();
    } else {
      const edgeIndex = await destVAnchor.read.edgeIndex([
        BigInt(parsedNote.sourceChainId),
      ]);
      const nei = await destVAnchor.read.getLatestNeighborEdges();
      destVAnchor.read.currentNeighborRootIndex([
        BigInt(parsedNote.sourceChainId),
      ]);
      const edge = await destVAnchor.read.edgeList([edgeIndex]);
      destRelayedRootBI = edge[1];
    }

    // Fixed the root to be 32 bytes
    const destRelayedRoot = toFixedHex(destRelayedRootBI);

    // The commitment of the note
    const commitment = generateCircomCommitment(parsedNote);

    let commitmentIndex: number;

    // If we haven't had any leaves from this chain yet, we need to fetch them
    if (!leavesMap[parsedNote.sourceChainId]) {
      // Set up a provider for the source chain
      const { chainId } = parseTypedChainId(+parsedNote.sourceChainId);
      const sourceAnchorId = parsedNote.sourceIdentifyingData;

      const sourcePublicClient = getPublicClient({ chainId });
      const sourceVAnchorContract = getContract({
        abi: VAnchor__factory.abi,
        address: ensureHex(sourceAnchorId),
        publicClient: sourcePublicClient,
      });

      const resourceId = ResourceId.newFromContractAddress(
        sourceVAnchorContract.address,
        ChainType.EVM,
        chainId
      );

      const leafStorage = await bridgeStorageFactory(resourceId.toString());
      const { provingLeaves, commitmentIndex: leafIndex } =
        await this.inner.getVAnchorLeaves(sourceVAnchorContract, leafStorage, {
          treeHeight,
          targetRoot: destRelayedRoot,
          commitment,
          tx,
        });

      // Validate that the commitment is in the tree
      if (leafIndex === -1) {
        return Promise.reject(
          WebbError.from(WebbErrorCodes.CommitmentNotInTree)
        );
      }

      leavesMap[parsedNote.sourceChainId] = provingLeaves.map((leaf) => {
        return hexToU8a(leaf);
      });

      commitmentIndex = leafIndex;
    } else {
      const leaves = leavesMap[parsedNote.sourceChainId].map((leaf) =>
        u8aToHex(leaf)
      );

      tx?.next(TransactionState.ValidatingLeaves, undefined);
      const { provingLeaves, leafIndex } =
        await calculateProvingLeavesAndCommitmentIndex(
          treeHeight,
          leaves,
          destRelayedRoot,
          commitment.toString()
        );

      // Validate that the commitment is in the tree
      if (leafIndex === -1) {
        return Promise.reject(
          WebbError.from(WebbErrorCodes.CommitmentNotInTree)
        );
      }

      tx?.next(TransactionState.ValidatingLeaves, true);

      commitmentIndex = leafIndex;

      // If the proving leaves are more than the leaves we have,
      // that means the commitment is not in the leaves we have
      // so we need to reset the leaves
      if (provingLeaves.length > leaves.length) {
        leavesMap[parsedNote.sourceChainId] = provingLeaves.map((leaf) =>
          hexToU8a(leaf)
        );
      }
    }

    const utxo = await utxoFromVAnchorNote(parsedNote, commitmentIndex);

    return {
      leafIndex: commitmentIndex,
      utxo,
      amount,
    };
  }

  private async getVAnchor(
    payload: Note,
    isDestAnchor = false
  ):
    | Promise<GetContractReturnType<typeof VAnchor__factory.abi, PublicClient>>
    | never {
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

    return this.inner.getVAnchorContractByAddress(vanchorAddress);
  }

  private async getTokenWrapperContract(payload: Note, isDest = false) {
    const vAnchor = await this.getVAnchor(payload, isDest);
    const currentWebbToken = await vAnchor.read.token();
    return getContract({
      abi: FungibleTokenWrapper__factory.abi,
      address: currentWebbToken,
      publicClient: this.inner.publicClient,
    });
  }

  private async checkHasBalance(
    payload: Note,
    wrapUnwrapToken: string
  ): Promise<void> | never {
    const account = this.inner.walletClient.account;
    if (!account) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }

    // Checking for balance of the wrapUnwrapToken
    let hasBalance: boolean;
    // If the `wrapUnwrapToken` is the `ZERO_ADDRESS`, we are wrapping
    // the native token. Therefore, we must check the native balance.
    if (checkNativeAddress(wrapUnwrapToken)) {
      const nativeBalance = await this.inner.publicClient.getBalance({
        address: account.address,
      });
      hasBalance = nativeBalance >= BigInt(payload.note.amount);
    } else {
      // If the `wrapUnwrapToken` is not the `ZERO_ADDRESS`, we assume that
      // the `wrapUnwrapToken` has been set to either the wrappedToken address
      // of the address of a wrappable ERC20 token. In either case, we can check the
      // balance using the `ERC20` contract.
      const erc20Contract = getContract({
        address: ensureHex(wrapUnwrapToken),
        abi: ERC20__factory.abi,
        publicClient: this.inner.publicClient,
      });
      const balance = await erc20Contract.read.balanceOf([account.address]);
      console.log('Balance: ', balance);
      hasBalance = balance >= BigInt(payload.note.amount);
    }

    // Notification failed transaction if not enough balance
    if (!hasBalance) {
      const { chainId, chainType } = parseTypedChainId(
        +payload.note.targetChainId
      );
      const resourceId = await this.getResourceId(
        payload.note.targetIdentifyingData,
        chainId,
        chainType
      );

      this.emit('stateChange', TransactionState.Failed);
      await this.inner.noteManager?.removeNote(resourceId, payload);
      throw new Error('Not enough balance');
    }
  }

  private async checkApproval(
    tx: Transaction<NewNotesTxResult>,
    payload: Note,
    wrapUnwrapToken: string,
    tokenWrapper: GetContractReturnType<
      typeof FungibleTokenWrapper__factory.abi,
      PublicClient
    >
  ): Promise<void> | never {
    const { note } = payload;
    const { amount } = note;

    const account = this.inner.walletClient.account;
    if (!account) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }

    const srcVAnchor = await this.inner.getVAnchorInstance(
      ensureHex(payload.note.sourceIdentifyingData),
      this.inner.publicClient
    );

    const spenderAddress = srcVAnchor.contract.address;
    const currentWebbToken = srcVAnchor.getWebbToken();

    const amountBI = BigInt(amount);

    const approvalValue = await tokenWrapper.read.getAmountToWrap([amountBI]);

    const isNative = checkNativeAddress(wrapUnwrapToken);

    // If the `wrapUnwrapToken` is different from the `currentWebbToken` address,
    // we are wrapping / unwrapping. otherwise, we are depositing / withdrawing.
    const isWrapOrUnwrap = wrapUnwrapToken !== currentWebbToken.address;

    // Only non-native tokens require approval
    if (!isNative) {
      const isRequiredApproval = !isWrapOrUnwrap
        ? await srcVAnchor.isWebbTokenApprovalRequired(amountBI, account)
        : await srcVAnchor.isWrappableTokenApprovalRequired(
            ensureHex(wrapUnwrapToken),
            approvalValue,
            account
          );

      if (isRequiredApproval) {
        let approvalHash: string;

        tx.next(TransactionState.Intermediate, {
          name: 'Approval is required for depositing',
          data: {
            tokenAddress: wrapUnwrapToken,
          },
        });

        if (isWrapOrUnwrap) {
          // approve the wrappable asset
          approvalHash = await this.inner.walletClient.writeContract({
            address: ensureHex(wrapUnwrapToken),
            abi: ERC20__factory.abi,
            functionName: 'approve',
            args: [spenderAddress, approvalValue],
            account,
            chain: this.inner.walletClient.chain,
            gas: BigInt('0x5B8D80'),
          });
        } else {
          approvalHash = await this.inner.walletClient.writeContract({
            address: currentWebbToken.address,
            abi: currentWebbToken.abi,
            functionName: 'approve',
            args: [spenderAddress, amountBI],
            account,
            chain: this.inner.walletClient.chain,
            gas: BigInt('0x5B8D80'),
          });
        }

        tx.next(TransactionState.Intermediate, {
          name: 'Approved',
          data: {
            txHash: approvalHash,
          },
        });
      }
    }
  }
}
