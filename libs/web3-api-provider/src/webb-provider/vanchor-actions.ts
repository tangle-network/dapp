import getWagmiConfig from '@webb-tools/dapp-config/wagmi-config';
import {
  ActiveWebbRelayer,
  ParametersOfTransactMethod,
  RelayedChainInput,
  RelayedWithdrawResult,
  TransactionPayloadType,
  VAnchorActions,
  calculateProvingLeavesAndCommitmentIndex,
  generateCircomCommitment,
  isVAnchorDepositPayload,
  isVAnchorTransferPayload,
  isVAnchorWithdrawPayload,
  padHexString,
  utxoFromVAnchorNote,
  type TransferTransactionPayloadType,
  type WithdrawTransactionPayloadType,
} from '@webb-tools/abstract-api-provider';
import validateNoteLeafIndex from '@webb-tools/abstract-api-provider/utils/validateNoteLeafIndex';
import { NeighborEdge } from '@webb-tools/abstract-api-provider/vanchor/types';
import {
  bridgeStorageFactory,
  registrationStorageFactory,
} from '@webb-tools/browser-utils/storage';
import {
  ERC20__factory,
  FungibleTokenWrapper__factory,
  VAnchor__factory,
} from '@webb-tools/contracts';
import {
  ApiConfig,
  ZERO_BIG_INT,
  ZERO_BYTES32,
  ensureHex,
} from '@webb-tools/dapp-config';
import {
  WebbError,
  WebbErrorCodes,
  checkNativeAddress,
} from '@webb-tools/dapp-types';
import {
  ChainType,
  Keypair,
  Note,
  ResourceId,
  Utxo,
  parseTypedChainId,
  toFixedHex,
} from '@webb-tools/sdk-core';
import {
  Address,
  GetContractReturnType,
  Hash,
  PublicClient,
  Client as ViemClient,
  getContract,
  zeroAddress,
} from 'viem';
import { getPublicClient, getWalletClient } from 'wagmi/actions';
import { WebbWeb3Provider } from '../webb-provider';
import { hexToU8a } from '@polkadot/util';

export class Web3VAnchorActions extends VAnchorActions<
  'web3',
  WebbWeb3Provider
> {
  static async getNextIndex(
    apiConfig: ApiConfig,
    typedChainId: number,
    fungibleCurrencyId: number,
  ): Promise<bigint> {
    const { chainId } = parseTypedChainId(typedChainId);

    const anchor = apiConfig.getAnchorIdentifier(
      fungibleCurrencyId,
      typedChainId,
    );
    if (!anchor) {
      throw WebbError.from(WebbErrorCodes.NoFungibleTokenAvailable);
    }

    const client = getPublicClient(getWagmiConfig(), {
      chainId,
    });

    if (!client) {
      throw WebbError.from(WebbErrorCodes.NoClientAvailable);
    }

    const vAnchorContract = getContract({
      abi: VAnchor__factory.abi,
      address: ensureHex(anchor),
      client,
    });

    const nextIdx = await vAnchorContract.read.getNextIndex();

    return BigInt(nextIdx);
  }

  async prepareTransaction(
    payload: TransactionPayloadType,
    wrapUnwrapToken: string,
  ): Promise<ParametersOfTransactMethod<'web3'>> | never {
    if (isVAnchorDepositPayload(payload)) {
      return this.prepareDeposit(payload, wrapUnwrapToken);
    } else if (isVAnchorWithdrawPayload(payload)) {
      return this.prepareWithdraw(payload, wrapUnwrapToken);
    } else if (isVAnchorTransferPayload(payload)) {
      return this.prepareTransfer(payload, wrapUnwrapToken);
    } else {
      // Handle by outer try/catch
      throw new Error('Invalid payload');
    }
  }

  async transactWithRelayer(
    activeRelayer: ActiveWebbRelayer,
    txArgs: ParametersOfTransactMethod<'web3'>,
    _changeNotes: Note[],
  ): Promise<Hash> | never {
    const [contractAddress, rawInputUtxos, rawOutputUtxos, ...restArgs] =
      txArgs;

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
      this.inner.publicClient,
    );

    // Pad the input & output utxo
    const inputUtxos = await vAnchor.padUtxos(rawInputUtxos, 16); // 16 is the require number of inputs (for 8-sided bridge)
    const outputUtxos = await vAnchor.padUtxos(rawOutputUtxos, 2); // 2 is the require number of outputs (for 8-sided bridge)

    const { publicInputs } = await vAnchor.setupTransaction(
      inputUtxos,
      [outputUtxos[0], outputUtxos[1]],
      ...restArgs,
    );

    const relayedVAnchorWithdraw = await activeRelayer.initWithdraw('vAnchor');

    const relayedDepositTxPayload =
      relayedVAnchorWithdraw.generateWithdrawRequest<
        typeof chainInfo,
        'vAnchor'
      >(chainInfo, {
        chainId: +chainId.toString(),
        id: contractAddress,
        proofData: {
          proof: publicInputs.proof,
          extensionRoots: publicInputs.extensionRoots,
          extDataHash: toFixedHex(publicInputs.extDataHash),
          publicAmount: publicInputs.publicAmount,
          roots: publicInputs.roots,
          outputCommitments: publicInputs.outputCommitments.map((output) =>
            padHexString(ensureHex(output.toString(16))),
          ),
          inputNullifiers: publicInputs.inputNullifiers.map((nullifier) =>
            padHexString(ensureHex(nullifier.toString(16))),
          ),
        },
      });

    // Subscribe to the relayer's transaction status.
    relayedVAnchorWithdraw.watcher.subscribe(([results]) => {
      switch (results) {
        case RelayedWithdrawResult.PreFlight:
          break;
        case RelayedWithdrawResult.OnFlight:
          break;
        case RelayedWithdrawResult.Continue:
          break;
        case RelayedWithdrawResult.CleanExit:
          break;
        case RelayedWithdrawResult.Errored: {
          break;
        }
      }
    });

    // Send the transaction to the relayer.
    relayedVAnchorWithdraw.send(relayedDepositTxPayload, +`${chainId}`);
    const [, txHash = ''] = await relayedVAnchorWithdraw.await();
    return ensureHex(txHash);
  }

  async transact(
    contractAddress: Address,
    inputs: Utxo[],
    outputs: Utxo[],
    fee: bigint,
    refund: bigint,
    recipient: Address,
    relayer: Address,
    wrapUnwrapToken: Address,
    leavesMap: Record<string, Uint8Array[]>,
  ) {
    const vAnchor = await this.inner.getVAnchorInstance(
      contractAddress,
      this.inner.publicClient,
    );

    const typedChainId = this.inner.typedChainId;

    let gasLimit: bigint | undefined;
    const walletClient = await getWalletClient(getWagmiConfig(), {
      chainId: parseTypedChainId(typedChainId).chainId,
      connector: this.inner.connector,
    });

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
        walletClient,
      },
    );

    return hash;
  }

  async waitForFinalization(hash: Hash): Promise<void> {
    // Wait for the transaction to be finalized.
    await this.inner.publicClient.waitForTransactionReceipt({ hash });
  }

  async getLatestNeighborEdges(
    fungibleId: number,
    typedChainIdArg?: number | undefined,
  ): Promise<ReadonlyArray<NeighborEdge>> {
    const typedChainId = typedChainIdArg ?? this.inner.typedChainId;
    const anchorId = this.inner.config.getAnchorIdentifier(
      fungibleId,
      typedChainId,
    );

    if (!anchorId) {
      throw WebbError.from(WebbErrorCodes.AnchorIdNotFound);
    }

    const vAnchorContract = this.inner.getVAnchorContractByAddressAndProvider(
      anchorId,
      getPublicClient(getWagmiConfig(), {
        chainId: parseTypedChainId(typedChainId).chainId,
        // TODO: Fix type casting here
      }) as any,
    );

    return vAnchorContract.read.getLatestNeighborEdges();
  }

  // Check if the evm address and keyData pairing has already registered.
  async isPairRegistered(
    anchorAddress: string,
    account: string,
    keyData: string,
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
    keyData: Address,
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
      const { request } = await vAnchorContract.simulate.register(
        [{ owner: account, keyData }],
        { account },
      );

      const txHash = await this.inner.walletClient.writeContract(request);

      await this.inner.publicClient.waitForTransactionReceipt({ hash: txHash });
    } catch {
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
    owner: Keypair,
    startingBlock?: bigint,
    abortSignal?: AbortSignal,
  ): Promise<Note[]> {
    const vAnchorContract =
      this.inner.getVAnchorContractByAddress(anchorAddress);

    const notes = await this.inner.getVAnchorNotesFromChain(
      vAnchorContract,
      owner,
      startingBlock,
      abortSignal,
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
    },
  ): Promise<bigint> | never {
    const account = this.inner.walletClient.account;
    if (!account) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }

    const vAnchorInstance = await this.inner.getVAnchorInstance(
      vAnchorAddress,
      this.inner.publicClient,
    );

    const inUtxos = await vAnchorInstance.padUtxos(option.inputs, 16); // 16 is the max number of inputs
    const [outUtxo1, outUtxo2] = await vAnchorInstance.padUtxos(
      option.outputs,
      2,
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
        option.leavesMap,
      );

    const options = await vAnchorInstance.getWrapUnwrapOptions(
      extAmount,
      option.refund,
      option.wrapUnwrapToken,
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
      },
    );
  }

  async commitmentsSetup(notes: Note[]) {
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
    addressOrTreeId: string,
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
      // TODO: Fix type casting here
      this.inner.publicClient as any,
      getContract({
        address: ensureHex(addressOrTreeId),
        abi: VAnchor__factory.abi,
        client: this.inner.publicClient,
      }),
      receipt.blockNumber,
      receipt.blockNumber,
    );

    // Get the leaf index of the note
    const depositedCommitment = await generateCircomCommitment(note.note);
    const log = logs.find((log) => log.args.commitment === depositedCommitment);
    if (!log) {
      console.error(
        `Leaf index not found in log ${log}, falling back to \`${ZERO_BIG_INT}\``,
      );
      return ZERO_BIG_INT;
    }

    return log.args.leafIndex;
  }

  async getNextIndex(
    typedChainId: number,
    fungibleCurrencyId: number,
  ): Promise<bigint> {
    const chain = this.inner.config.chains[typedChainId];
    const anchor = this.inner.config.getAnchorIdentifier(
      fungibleCurrencyId,
      typedChainId,
    );
    if (!chain || !anchor) {
      throw WebbError.from(WebbErrorCodes.NoFungibleTokenAvailable);
    }

    const publicClient = getPublicClient(getWagmiConfig(), {
      chainId: chain.id,
    });
    if (!publicClient) {
      throw WebbError.from(WebbErrorCodes.NoClientAvailable);
    }

    const vAnchorContract = getContract({
      abi: VAnchor__factory.abi,
      address: ensureHex(anchor),
      client: publicClient,
    });

    const nextIdx = await vAnchorContract.read.getNextIndex();

    return BigInt(nextIdx);
  }

  async getResourceId(
    anchorAddress: string,
    chainId: number,
    chainType: ChainType,
  ): Promise<ResourceId> {
    return new ResourceId(anchorAddress, chainType, chainId);
  }

  async validateInputNotes(
    notes: readonly Note[],
    typedChainId: number,
    fungibleId: number,
  ): Promise<boolean> {
    const edges = await this.getLatestNeighborEdges(fungibleId, typedChainId);
    const nextIdx = await this.getNextIndex(typedChainId, fungibleId);

    return notes.every((note) => {
      if (note.note.sourceChainId === typedChainId.toString()) {
        return note.note.index ? BigInt(note.note.index) < nextIdx : true;
      } else {
        return validateNoteLeafIndex(note, edges);
      }
    });
  }

  // ================== PRIVATE METHODS ===================

  private async prepareDeposit(
    payload: Note,
    wrapToken: string,
  ): Promise<ParametersOfTransactMethod<'web3'>> | never {
    // Get the wrapped token and check the balance and approvals
    const tokenWrapper = await this.getTokenWrapperContract(payload);
    if (wrapToken === '') {
      wrapToken = tokenWrapper.address;
    }

    await this.checkHasBalance(payload, wrapToken);

    await this.checkApproval(payload, wrapToken, tokenWrapper);

    const secrets = payload.note.secrets.split(':');
    const depositUtxo = await this.inner.generateUtxo({
      curve: payload.note.curve,
      backend: payload.note.backend,
      amount: payload.note.amount,
      originChainId: payload.note.sourceChainId.toString(),
      chainId: payload.note.targetChainId.toString(),
      keypair: new Keypair(`0x${secrets[2]}`),
      blinding: hexToU8a(`0x${secrets[3]}`),
    });

    return Promise.resolve([
      ensureHex(payload.note.sourceIdentifyingData), // contractAddress
      [], // inputs
      [depositUtxo], // outputs
      ZERO_BIG_INT, // fee
      ZERO_BIG_INT, // refund
      zeroAddress, // recipient
      zeroAddress, // relayer
      wrapToken, // wrapUnwrapToken
      {}, // leavesMap,
    ]);
  }

  private async prepareWithdraw(
    payload: WithdrawTransactionPayloadType,
    unwrapToken: string,
  ): Promise<ParametersOfTransactMethod<'web3'>> | never {
    const { changeUtxo, notes, recipient, refundAmount, feeAmount } = payload;

    const { inputUtxos, leavesMap } = await this.commitmentsSetup(notes);

    const relayer =
      this.inner.relayerManager.activeRelayer?.beneficiary ?? zeroAddress;

    // If no relayer is set, then the fee is 0, otherwise it is the fee amount
    const fee = relayer === zeroAddress ? ZERO_BIG_INT : feeAmount;

    return Promise.resolve([
      ensureHex(notes[0].note.targetIdentifyingData), // contractAddress
      inputUtxos, // inputs
      [changeUtxo], // outputs
      fee, // fee
      refundAmount, // refund
      ensureHex(recipient), // recipient
      ensureHex(relayer), // relayer
      unwrapToken, // wrapUnwrapToken
      leavesMap, // leavesMap
    ]);
  }

  private async prepareTransfer(
    payload: TransferTransactionPayloadType,
    _unwrapToken: string,
  ): Promise<ParametersOfTransactMethod<'web3'>> | never {
    const {
      changeUtxo,
      transferUtxo,
      notes,
      feeAmount,
      refundAmount,
      refundRecipient: _refundRecipient,
    } = payload;

    const { inputUtxos, leavesMap } = await this.commitmentsSetup(notes);

    const relayer =
      this.inner.relayerManager.activeRelayer?.beneficiary ?? zeroAddress;

    // If no relayer is set, then the fee is 0, otherwise it is the fee amount
    const feeValue = relayer === zeroAddress ? ZERO_BIG_INT : feeAmount;
    const refundValue = relayer === zeroAddress ? ZERO_BIG_INT : refundAmount;

    // The recipient is the refund recipient
    // if the relayer is set and the refund recipient is set
    const refundRecipient =
      relayer === zeroAddress || _refundRecipient.length === 0
        ? zeroAddress
        : _refundRecipient;

    // set the anchor to make the transfer on (where the notes are being spent for the transfer)
    return Promise.resolve([
      ensureHex(notes[0].note.targetIdentifyingData), // contractAddress
      inputUtxos, // inputs
      [changeUtxo, transferUtxo], // outputs
      feeValue, // fee
      refundValue, // refund
      ensureHex(refundRecipient), // recipient
      ensureHex(relayer), // relayer
      '', // wrapUnwrapToken (not used for transfers)
      leavesMap, // leavesMap,
    ]);
  }

  private async fetchNoteLeaves(
    note: Note,
    leavesMap: Record<string, Uint8Array[]>,
    destVAnchor: GetContractReturnType<typeof VAnchor__factory.abi, ViemClient>,
    treeHeight: number,
  ): Promise<{ leafIndex: number; utxo: Utxo; amount: bigint }> | never {
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
      const edge = await destVAnchor.read.edgeList([edgeIndex]);
      destRelayedRootBI = edge[1];
    }

    // Fixed the root to be 32 bytes
    const destRelayedRoot = toFixedHex(destRelayedRootBI);

    // The commitment of the note
    const commitment = await generateCircomCommitment(parsedNote);

    let commitmentIndex: number;

    // If we haven't had any leaves from this chain yet, we need to fetch them
    if (!leavesMap[parsedNote.sourceChainId]) {
      // Set up a provider for the source chain
      const { chainId } = parseTypedChainId(+parsedNote.sourceChainId);
      const sourceAnchorId = parsedNote.sourceIdentifyingData;

      const sourcePublicClient = getPublicClient(getWagmiConfig(), { chainId });
      if (!sourcePublicClient) {
        throw WebbError.from(WebbErrorCodes.NoClientAvailable);
      }

      const sourceVAnchorContract = getContract({
        abi: VAnchor__factory.abi,
        address: ensureHex(sourceAnchorId),
        client: sourcePublicClient,
      });

      const resourceId = ResourceId.newFromContractAddress(
        sourceVAnchorContract.address,
        ChainType.EVM,
        chainId,
      );

      const leafStorage = await bridgeStorageFactory(resourceId.toString());
      const { provingLeaves, commitmentIndex: leafIndex } =
        await this.inner.getVAnchorLeaves(sourceVAnchorContract, leafStorage, {
          treeHeight,
          targetRoot: destRelayedRoot,
          commitment,
        });

      // Validate that the commitment is in the tree
      if (leafIndex === -1) {
        return Promise.reject(
          WebbError.from(WebbErrorCodes.CommitmentNotInTree),
        );
      }

      leavesMap[parsedNote.sourceChainId] = provingLeaves.map((leaf) => {
        return hexToU8a(leaf);
      });

      commitmentIndex = leafIndex;
    } else {
      const leaves = leavesMap[parsedNote.sourceChainId].map((leaf) =>
        toFixedHex(leaf),
      );

      const { provingLeaves, leafIndex } =
        await calculateProvingLeavesAndCommitmentIndex(
          treeHeight,
          leaves,
          destRelayedRoot,
          commitment.toString(),
        );

      // Validate that the commitment is in the tree
      if (leafIndex === -1) {
        return Promise.reject(
          WebbError.from(WebbErrorCodes.CommitmentNotInTree),
        );
      }

      commitmentIndex = leafIndex;

      // If the proving leaves are more than the leaves we have,
      // that means the commitment is not in the leaves we have
      // so we need to reset the leaves
      if (provingLeaves.length > leaves.length) {
        leavesMap[parsedNote.sourceChainId] = provingLeaves.map((leaf) =>
          hexToU8a(leaf),
        );
      }
    }

    console.log('Note index: ', parsedNote.index);
    console.log('Commitment index: ', commitmentIndex);
    const utxo = await utxoFromVAnchorNote(parsedNote, commitmentIndex);

    return {
      leafIndex: commitmentIndex,
      utxo,
      amount,
    };
  }

  private async getVAnchor(
    payload: Note,
    isDestAnchor = false,
  ):
    | Promise<GetContractReturnType<typeof VAnchor__factory.abi, ViemClient>>
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
      client: this.inner.publicClient,
    });
  }

  private async checkHasBalance(
    payload: Note,
    wrapUnwrapToken: string,
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
        client: this.inner.publicClient,
      });
      const balance = await erc20Contract.read.balanceOf([account.address]);
      hasBalance = balance >= BigInt(payload.note.amount);
    }

    // Notification failed transaction if not enough balance
    if (!hasBalance) {
      throw new Error('Not enough balance');
    }
  }

  private async checkApproval(
    payload: Note,
    wrapUnwrapToken: string,
    tokenWrapper: GetContractReturnType<
      typeof FungibleTokenWrapper__factory.abi,
      PublicClient
    >,
  ): Promise<void> | never {
    const { note } = payload;
    const { amount } = note;

    const account = this.inner.walletClient.account;
    if (!account) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }

    const srcVAnchor = await this.inner.getVAnchorInstance(
      ensureHex(payload.note.sourceIdentifyingData),
      this.inner.publicClient,
      true,
    );

    const currentFungibleToken = srcVAnchor.getWebbToken();

    const amountBI = BigInt(amount);

    const approvalValue = await tokenWrapper.read.getAmountToWrap([amountBI]);

    const isNative = checkNativeAddress(wrapUnwrapToken);

    // If the `wrapUnwrapToken` is different from the `currentWebbToken` address,
    // we are wrapping / unwrapping. otherwise, we are depositing / withdrawing.
    const isWrapOrUnwrap = wrapUnwrapToken !== currentFungibleToken.address;

    // Only non-native tokens require approval
    if (!isNative) {
      const isRequiredApproval = !isWrapOrUnwrap
        ? await srcVAnchor.isWebbTokenApprovalRequired(amountBI, account)
        : await srcVAnchor.isWrappableTokenApprovalRequired(
            ensureHex(wrapUnwrapToken),
            approvalValue,
            account,
          );

      if (isRequiredApproval) {
        let approvalHash: Hash;

        if (isWrapOrUnwrap) {
          // approve the wrappable asset
          const tokenContract = getContract({
            address: ensureHex(wrapUnwrapToken),
            abi: ERC20__factory.abi,
            client: this.inner.publicClient,
          });

          // On the wrap case, we need to approve the tokenWrapper contract
          // to spend the token on behalf of the user to wrap it.
          const { request } = await tokenContract.simulate.approve(
            [currentFungibleToken.address, approvalValue],
            {
              gas: BigInt('0x5B8D80'),
              account: account.address,
            },
          );

          approvalHash = await this.inner.walletClient.writeContract(
            // TODO: Fix type casting here
            request as any,
          );
        } else {
          // If we are depositing (without wrapping), we need to approve the
          // VAnchor contract to spend the user's fungible token.
          const { request } = await currentFungibleToken.simulate.approve(
            [srcVAnchor.contract.address, amountBI],
            {
              gas: BigInt('0x5B8D80'),
              account: account.address,
            },
          );

          approvalHash = await this.inner.walletClient.writeContract(request);
        }

        await this.inner.publicClient.waitForTransactionReceipt({
          hash: approvalHash,
        });
      }
    }
  }
}
