import {
  CancellationToken,
  FixturesStatus,
  NewNotesTxResult,
  Transaction,
  TransactionPayloadType,
  TransactionState,
  VAnchorActions,
  WithdrawTransactionPayloadType,
} from '@webb-tools/abstract-api-provider';
import { VAnchor } from '@webb-tools/anchors';
import {
  bridgeStorageFactory,
  registrationStorageFactory,
} from '@webb-tools/browser-utils/storage';
import { ERC20__factory } from '@webb-tools/contracts';
import { checkNativeAddress } from '@webb-tools/dapp-types';
import {
  VAnchorContract,
  generateCircomCommitment,
  utxoFromVAnchorNote,
} from '@webb-tools/evm-contracts';
import {
  fetchVAnchorKeyFromAws,
  fetchVAnchorWasmFromAws,
} from '@webb-tools/fixtures-deployments';
import { NoteManager } from '@webb-tools/note-manager';
import {
  CircomUtxo,
  Keypair,
  MerkleTree,
  Note,
  Utxo,
  buildVariableWitnessCalculator,
} from '@webb-tools/sdk-core';
import { FungibleTokenWrapper } from '@webb-tools/tokens';
import {
  ZERO_ADDRESS,
  ZkComponents,
  hexToU8a,
  u8aToHex,
} from '@webb-tools/utils';
import {
  BigNumber,
  BigNumberish,
  ContractReceipt,
  ContractTransaction,
  ethers,
} from 'ethers';

import { Web3Provider } from '../ext-provider';
import { WebbWeb3Provider } from '../webb-provider';

export const isVAnchorDepositPayload = (
  payload: TransactionPayloadType
): payload is Note => {
  return payload instanceof Note;
};

export const isVAnchorWithdrawPayload = (
  payload: TransactionPayloadType
): payload is WithdrawTransactionPayloadType => {
  const notes: Note[] | undefined = payload['notes'];
  if (!notes) {
    return false;
  }

  const isNotesValid = notes.every((note) => note instanceof Note);
  if (!isNotesValid) {
    return false;
  }

  return (
    typeof payload['recipient'] === 'string' &&
    payload['recipient'].length > 0 &&
    typeof payload['amount'] === 'number' &&
    payload['amount'] > 0
  );
};

export const isVAnchorTransferPayload = (
  payload: TransactionPayloadType
): boolean => {
  return false;
};

export class Web3VAnchorActions extends VAnchorActions<WebbWeb3Provider> {
  async prepareTransaction(
    tx: Transaction<NewNotesTxResult>,
    payload: TransactionPayloadType,
    wrapUnwrapToken: string
  ): Promise<Awaited<Parameters<Web3VAnchorActions['transact']>>> | never {
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
        {}, // leavesMap
      ]);
    } else if (isVAnchorWithdrawPayload(payload)) {
      const { notes, recipient, amount } = payload;

      if (wrapUnwrapToken === '') {
        const tokenWrapper = await this.getTokenWrapper(tx, notes[0], true);
        wrapUnwrapToken = tokenWrapper.contract.address;
      }

      const { targetChainId: destTypedChainId, denomination } = notes[0].note;

      const { inputUtxos, leavesMap, sumInputNotes } =
        await this.commitmentsSetup(tx, notes);

      const keypair =
        this.inner.noteManager?.getKeypair() ??
        NoteManager.keypairFromNote(notes[0]);

      // Create the output UTXOs
      const changeAmount = sumInputNotes.sub(
        ethers.utils.parseUnits(amount.toString(), denomination)
      );
      const changeUtxo = await CircomUtxo.generateUtxo({
        curve: 'Bn254',
        backend: 'Circom',
        amount: changeAmount.toString(),
        chainId: destTypedChainId.toString(),
        keypair,
        originChainId: destTypedChainId.toString(),
      });

      const relayer =
        this.inner.relayerManager.activeRelayer?.account ?? ZERO_ADDRESS;

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
      throw new Error('Invalid payload');
    } else {
      throw new Error('Invalid payload');
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
    leavesMap: Record<string, Uint8Array[]>
  ): Promise<ContractReceipt> {
    const signer = await this.inner.getProvider().getSigner();

    const smallFixtures: ZkComponents = await this.fetchSmallFixtures(tx, 1);
    const dummyFixtures: ZkComponents = {
      zkey: new Uint8Array(),
      wasm: Buffer.from(''),
      witnessCalculator: undefined,
    };

    const vanchor = await VAnchor.connect(
      contractAddress,
      smallFixtures,
      dummyFixtures,
      signer
    );

    tx.txHash = '0x';
    tx.next(TransactionState.SendingTransaction, '0x');

    return vanchor.transact(
      inputs,
      outputs,
      fee,
      refund,
      recipient,
      relayer,
      wrapUnwrapToken,
      leavesMap
    );
  }

  async fetchSmallFixtures(
    tx: Transaction<NewNotesTxResult>,
    maxEdges: number
  ): Promise<ZkComponents> {
    return this.fetchFixtures(tx, maxEdges, true);
  }

  async fetchLargeFixtures(
    tx: Transaction<NewNotesTxResult>,
    maxEdges: number
  ): Promise<ZkComponents> {
    return this.fetchFixtures(tx, maxEdges, false);
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
    const vanchor = this.inner.getVariableAnchorByAddress(anchorAddress);
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
    const treeHeight = await destVAnchor._contract.getLevels();

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
    destVAnchor: VAnchorContract,
    treeHeight: number
  ) {
    const parsedNote = note.note;
    const amount = BigNumber.from(parsedNote.amount);

    // fetch leaves if we don't have them
    if (leavesMap[parsedNote.sourceChainId] === undefined) {
      // Set up a provider for the source chain
      const sourceAddress = parsedNote.sourceIdentifyingData;
      const sourceChainConfig =
        this.inner.config.chains[Number(parsedNote.sourceChainId)];
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
        tx.cancelToken.abortSignal
      );
      console.log('leaves', leaves);
      leavesMap[parsedNote.sourceChainId] = leaves.map((leaf) => {
        return hexToU8a(leaf);
      });
    }

    let destHistorySourceRoot: string;

    // Get the latest root that has been relayed from the source chain to the destination chain
    if (parsedNote.sourceChainId === parsedNote.targetChainId) {
      const destRoot = await destVAnchor.inner.getLastRoot();
      destHistorySourceRoot = destRoot.toHexString();
    } else {
      const edgeIndex = await destVAnchor.inner.edgeIndex(
        parsedNote.sourceChainId
      );
      const edge = await destVAnchor.inner.edgeList(edgeIndex);
      destHistorySourceRoot = edge[1].toHexString();
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

  private async fetchFixtures(
    tx: Transaction<NewNotesTxResult>,
    maxEdges: number,
    isSmall: boolean
  ): Promise<ZkComponents> {
    this.emit('stateChange', TransactionState.FetchingFixtures);
    const fixturesList = new Map<string, FixturesStatus>();
    fixturesList.set('VAnchorKey', 'Waiting');
    fixturesList.set('VAnchorWasm', 'Waiting');
    tx.next(TransactionState.FetchingFixtures, {
      fixturesList,
    });
    fixturesList.set('VAnchorKey', 0);
    const smallKey = await fetchVAnchorKeyFromAws(
      maxEdges,
      isSmall,
      tx.cancelToken.abortSignal
    );
    fixturesList.set('VAnchorKey', 'Done');
    fixturesList.set('VAnchorWasm', 0);
    const smallWasm = await fetchVAnchorWasmFromAws(
      maxEdges,
      isSmall,
      tx.cancelToken.abortSignal
    );
    fixturesList.set('VAnchorWasm', 'Done');

    return {
      zkey: smallKey,
      wasm: Buffer.from(smallWasm),
      witnessCalculator: buildVariableWitnessCalculator,
    };
  }

  private async getVAnchor(
    tx: Transaction<NewNotesTxResult>,
    payload: Note,
    isDestAnchor = false
  ): Promise<VAnchorContract> {
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

    return this.inner.getVariableAnchorByAddress(vanchorAddress);
  }

  private async getTokenWrapper(
    tx: Transaction<NewNotesTxResult>,
    payload: Note,
    isDest = false
  ): Promise<FungibleTokenWrapper> {
    const vAnchor = await this.getVAnchor(tx, payload, isDest);
    const currentWebbToken = await vAnchor.getWebbToken();
    return FungibleTokenWrapper.connect(
      currentWebbToken.address,
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
    const { amount, sourceChainId } = note;
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
        srcVAnchor._contract.address,
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
