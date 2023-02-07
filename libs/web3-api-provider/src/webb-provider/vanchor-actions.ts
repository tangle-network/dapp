import {
  ActiveWebbRelayer,
  ParametersOfTransactMethod,
  CancellationToken,
  NewNotesTxResult,
  Transaction,
  TransactionPayloadType,
  TransactionState,
  TransferTransactionPayloadType,
  VAnchorActions,
  WithdrawTransactionPayloadType,
  RelayedChainInput,
  padHexString,
  RelayedWithdrawResult,
} from '@webb-tools/abstract-api-provider';
import { VAnchor } from '@webb-tools/anchors';
import {
  bridgeStorageFactory,
  registrationStorageFactory,
} from '@webb-tools/browser-utils/storage';
import { ERC20__factory, VAnchor__factory } from '@webb-tools/contracts';
import { checkNativeAddress } from '@webb-tools/dapp-types';
import {
  CircomUtxo,
  Keypair,
  MerkleTree,
  Note,
  Utxo,
} from '@webb-tools/sdk-core';
import { FungibleTokenWrapper } from '@webb-tools/tokens';
import { ZERO_ADDRESS, hexToU8a, u8aToHex } from '@webb-tools/utils';
import {
  BigNumber,
  BigNumberish,
  ContractReceipt,
  ContractTransaction,
  Overrides,
} from 'ethers';

import { JsNote } from '@webb-tools/wasm-utils';
import { poseidon } from 'circomlibjs';
import { Web3Provider } from '../ext-provider';
import { WebbWeb3Provider } from '../webb-provider';

const isVAnchorDepositPayload = (
  payload: TransactionPayloadType
): payload is Note => {
  return payload instanceof Note;
};

const isVAnchorWithdrawPayload = (
  payload: TransactionPayloadType
): payload is WithdrawTransactionPayloadType => {
  const changeUtxo: Utxo | undefined = payload['changeUtxo'];
  if (!changeUtxo || !(changeUtxo instanceof Utxo)) {
    return false;
  }

  const notes: Note[] | undefined = payload['notes'];
  if (!notes) {
    return false;
  }

  const isNotesValid = notes.every((note) => note instanceof Note);
  if (!isNotesValid) {
    return false;
  }

  return (
    typeof payload['recipient'] === 'string' && payload['recipient'].length > 0
  );
};

const isVAnchorTransferPayload = (
  payload: TransactionPayloadType
): payload is TransferTransactionPayloadType => {
  const notes: Note[] | undefined = payload['notes'];
  if (!notes) {
    return false;
  }

  const isNotesValid = notes.every((note) => note instanceof Note);
  if (!isNotesValid) {
    return false;
  }

  return (
    payload['changeUtxo'] instanceof Utxo &&
    payload['transferUtxo'] instanceof Utxo
  );
};

const generateCircomCommitment = (note: JsNote): string => {
  const noteSecretParts = note.secrets.split(':');
  const chainId = BigNumber.from('0x' + noteSecretParts[0]).toString();
  const amount = BigNumber.from('0x' + noteSecretParts[1]).toString();
  const secretKey = '0x' + noteSecretParts[2];
  const blinding = '0x' + noteSecretParts[3];

  const keypair = new Keypair(secretKey);

  const hash = poseidon([chainId, amount, keypair.getPubKey(), blinding]);

  return BigNumber.from(hash).toHexString();
};

async function utxoFromVAnchorNote(
  note: JsNote,
  leafIndex: number
): Promise<Utxo> {
  const noteSecretParts = note.secrets.split(':');
  const chainId = note.targetChainId;
  const amount = BigNumber.from('0x' + noteSecretParts[1]).toString();
  const secretKey = '0x' + noteSecretParts[2];
  const blinding = '0x' + noteSecretParts[3];
  const originChainId = note.sourceChainId;

  const keypair = new Keypair(secretKey);

  return CircomUtxo.generateUtxo({
    curve: note.curve,
    backend: note.backend,
    amount,
    blinding: hexToU8a(blinding),
    originChainId,
    chainId,
    index: leafIndex.toString(),
    keypair,
  });
}

export class Web3VAnchorActions extends VAnchorActions<WebbWeb3Provider> {
  async prepareTransaction(
    tx: Transaction<NewNotesTxResult>,
    payload: TransactionPayloadType,
    wrapUnwrapToken: string
  ): Promise<ParametersOfTransactMethod> | never {
    tx.next(TransactionState.PreparingTransaction, undefined);
    if (isVAnchorDepositPayload(payload)) {
      // Get the wrapped token and check the balance and approvals
      const tokenWrapper = await this.getTokenWrapper(tx, payload);
      if (wrapUnwrapToken === '')
        wrapUnwrapToken = tokenWrapper.contract.address;

      await this.checkHasBalance(tx, payload, wrapUnwrapToken);

      await this.checkApproval(tx, payload, wrapUnwrapToken, tokenWrapper);

      const secrets = payload.note.secrets.split(':');
      const depositUtxo = await CircomUtxo.generateUtxo({
        curve: payload.note.curve,
        backend: payload.note.backend,
        amount: payload.note.amount,
        originChainId: payload.note.sourceChainId.toString(),
        chainId: payload.note.targetChainId.toString(),
        keypair: new Keypair(`0x${secrets[2]}`),
        blinding: hexToU8a(`0x${secrets[3]}`),
      });
      return Promise.resolve([
        tx, // tx
        payload.note.sourceIdentifyingData, // contractAddress
        [], // inputs
        [depositUtxo], // outputs
        0, // fee
        0, // refund
        ZERO_ADDRESS, // recipient
        ZERO_ADDRESS, // relayer
        wrapUnwrapToken, // wrapUnwrapToken
        {}, // leavesMap,
      ]);
    } else if (isVAnchorWithdrawPayload(payload)) {
      const { changeUtxo, notes, recipient } = payload;

      if (wrapUnwrapToken === '') {
        const tokenWrapper = await this.getTokenWrapper(tx, notes[0], true);
        wrapUnwrapToken = tokenWrapper.contract.address;
      }

      const { inputUtxos, leavesMap } = await this.commitmentsSetup(tx, notes);

      const relayer =
        this.inner.relayerManager.activeRelayer?.beneficiary ?? ZERO_ADDRESS;

      return Promise.resolve([
        tx, // tx
        notes[0].note.targetIdentifyingData, // contractAddress
        inputUtxos, // inputs
        [changeUtxo], // outputs
        0, // fee
        0, // refund
        recipient, // recipient
        relayer, // relayer
        wrapUnwrapToken, // wrapUnwrapToken
        leavesMap, // leavesMap
      ]);
    } else if (isVAnchorTransferPayload(payload)) {
      const { changeUtxo, transferUtxo, notes } = payload;

      const { inputUtxos, leavesMap } = await this.commitmentsSetup(tx, notes);

      // set the anchor to make the transfer on (where the notes are being spent for the transfer)
      return Promise.resolve([
        tx, // tx
        notes[0].note.targetIdentifyingData, // contractAddress
        inputUtxos, // inputs
        [changeUtxo, transferUtxo], // outputs
        0, // fee
        0, // refund
        ZERO_ADDRESS, // recipient
        this.inner.relayerManager.activeRelayer?.account ?? ZERO_ADDRESS, // relayer
        '', // wrapUnwrapToken (not used for transfers)
        leavesMap, // leavesMap
      ]);
    } else {
      console.error('Invalid payload');
    }
  }

  async transactWithRelayer(
    activeRelayer: ActiveWebbRelayer,
    txArgs: ParametersOfTransactMethod,
    changeNotes: Note[]
  ): Promise<void> {
    let txHash = '';

    const [tx, contractAddress, ...restArgs] = txArgs;

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

    const setupTransactionArgs = restArgs.slice(0, -1) as Parameters<
      VAnchor['setupTransaction']
    >;

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
          extAmount: extAmount as any,
          fee: extData.fee.toString() as any,
          encryptedOutput1: extData.encryptedOutput1,
          encryptedOutput2: extData.encryptedOutput2,
          refund: extData.refund.toString(),
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
        case RelayedWithdrawResult.Errored:
          tx.fail('Transaction with relayer failed');
          break;
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
    fee: BigNumberish,
    refund: BigNumberish,
    recipient: string,
    relayer: string,
    wrapUnwrapToken: string,
    leavesMap: Record<string, Uint8Array[]>,
    overridesTransaction?: Overrides
  ): Promise<ContractReceipt> {
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

    return vanchor.transact(
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

  private async commitmentsSetup(
    tx: Transaction<NewNotesTxResult>,
    notes: Note[]
  ) {
    if (notes.length === 0) {
      tx.fail('No notes to deposit');
      return;
    }

    const payload = notes[0];
    const destVAnchor = await this.getVAnchor(tx, payload, true);
    const treeHeight = await destVAnchor.contract.getLevels();

    // Loop through the notes and populate the leaves map
    const leavesMap: Record<string, Uint8Array[]> = {};

    const notesLeaves = await Promise.all(
      notes.map((note) =>
        this.fetchNoteLeaves(tx, note, leavesMap, destVAnchor, treeHeight)
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
      const leafStorage = await bridgeStorageFactory(+destTypedChainId);
      const leaves = await this.inner.getVariableAnchorLeaves(
        destVAnchor,
        leafStorage,
        tx.cancelToken.abortSignal
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

  private async fetchNoteLeaves(
    tx: Transaction<NewNotesTxResult>,
    note: Note,
    leavesMap: Record<string, Uint8Array[]>,
    destVAnchor: VAnchor,
    treeHeight: number
  ): Promise<{ leafIndex: number; utxo: Utxo; amount: BigNumber }> {
    tx.next(TransactionState.FetchingLeaves, {
      end: undefined,
      currentRange: [0, 1],
      start: 0,
    });

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

      const leafStorage = await bridgeStorageFactory(
        Number(parsedNote.sourceChainId)
      );
      const leaves = await this.inner.getVariableAnchorLeaves(
        sourceVAnchor,
        leafStorage,
        tx.cancelToken.abortSignal
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

    // Remove leaves from the leaves map which have not yet been relayed
    const provingTree = MerkleTree.createTreeWithRoot(
      treeHeight,
      leavesMap[parsedNote.sourceChainId].map((leaf) => u8aToHex(leaf)),
      destHistorySourceRoot
    );

    if (!provingTree) {
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

  private async getVAnchor(
    tx: Transaction<NewNotesTxResult>,
    payload: Note,
    isDestAnchor = false
  ): Promise<VAnchor> {
    const { note } = payload;
    const { sourceChainId, targetChainId } = note;
    const vanchors = await this.inner.methods.bridgeApi.getVAnchors();

    if (vanchors.length === 0) {
      tx.fail('No variable anchor configured for selected token');
      return;
    }

    const vanchor = vanchors[0];

    // Get the contract address for the src chain
    let vanchorAddress: string;

    if (isDestAnchor) {
      vanchorAddress = vanchor.neighbours[targetChainId] as string;
    } else {
      vanchorAddress = vanchor.neighbours[sourceChainId] as string;
    }

    if (!vanchorAddress) {
      tx.fail(`No Anchor for the chain ${note.targetChainId}`);
      return;
    }

    return await this.inner.getVariableAnchorByAddress(vanchorAddress);
  }

  private async getTokenWrapper(
    tx: Transaction<NewNotesTxResult>,
    payload: Note,
    isDest = false
  ): Promise<FungibleTokenWrapper> {
    const vAnchor = await this.getVAnchor(tx, payload, isDest);
    const currentWebbToken = await vAnchor.contract.token();
    return FungibleTokenWrapper.connect(
      currentWebbToken,
      this.inner.getEthersProvider().getSigner()
    );
  }

  private async checkHasBalance(
    tx: Transaction<NewNotesTxResult>,
    payload: Note,
    wrapUnwrapToken: string
  ): Promise<void> | never {
    const provider = this.inner.getEthersProvider();
    const signer = await provider.getSigner().getAddress();
    // Checking for balance of the wrapUnwrapToken
    let hasBalance: boolean;
    // If the `wrapUnwrapToken` is the `ZERO_ADDRESS`, we are wrapping
    // the native token. Therefore, we must check the native balance.
    if (wrapUnwrapToken === ZERO_ADDRESS) {
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
      tx.fail('Not enough balance');
      return;
    }
  }

  private async checkApproval(
    tx: Transaction<NewNotesTxResult>,
    payload: Note,
    wrapUnwrapToken: string,
    tokenWrapper: FungibleTokenWrapper
  ): Promise<void> {
    const { note } = payload;
    const { amount } = note;
    const srcVAnchor = await this.getVAnchor(tx, payload);
    const currentWebbToken = await srcVAnchor.getWebbToken();
    const approvalValue = await tokenWrapper.contract.getAmountToWrap(amount);
    let approvalTransaction: ContractTransaction;
    if (checkNativeAddress(wrapUnwrapToken)) {
      /// native token no approval needed
    } else if (
      wrapUnwrapToken === currentWebbToken.address &&
      (await srcVAnchor.isWebbTokenApprovalRequired(amount))
    ) {
      // approve the token
      approvalTransaction = await currentWebbToken.approve(
        srcVAnchor.contract.address,
        amount,
        {
          gasLimit: '0x5B8D80',
        }
      );
    } else if (
      await srcVAnchor.isWrappableTokenApprovalRequired(
        wrapUnwrapToken,
        approvalValue
      )
    ) {
      // approve the wrappable asset
      const token = ERC20__factory.connect(
        wrapUnwrapToken,
        this.inner.getEthersProvider().getSigner()
      );
      approvalTransaction = await token.approve(
        currentWebbToken.address,
        approvalValue,
        { gasLimit: '0x5B8D80' }
      );
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
