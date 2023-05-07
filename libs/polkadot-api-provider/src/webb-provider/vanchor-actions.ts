import { ApiPromise } from '@polkadot/api';
import { Codec } from '@polkadot/types/types';
import { decodeAddress, naclEncrypt, randomAsU8a } from '@polkadot/util-crypto';
import {
  ActiveWebbRelayer,
  FixturesStatus,
  generateCircomCommitment,
  isVAnchorDepositPayload,
  isVAnchorTransferPayload,
  isVAnchorWithdrawPayload,
  NewNotesTxResult,
  ParametersOfTransactMethod,
  Transaction,
  TransactionPayloadType,
  TransactionState,
  TransferTransactionPayloadType,
  utxoFromVAnchorNote,
  VAnchorActions,
  WithdrawTransactionPayloadType,
} from '@webb-tools/abstract-api-provider';
import { bridgeStorageFactory } from '@webb-tools/browser-utils';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types';
import {
  ArkworksProvingManager,
  Keypair,
  LeafIdentifier,
  MerkleTree,
  Note,
  parseTypedChainId,
  ProvingManagerSetupInput,
  randomBN,
  toFixedHex,
  Utxo,
  VAnchorProof,
} from '@webb-tools/sdk-core';
import { hexToU8a, u8aToHex, ZERO_ADDRESS } from '@webb-tools/utils';
import BN from 'bn.js';
import { formatUnits } from 'ethers/lib/utils';
import { firstValueFrom } from 'rxjs';
import { getLeafIndex } from '../mt-utils';
import createSubstrateResourceId from '../utils/createSubstrateResourceId';

import { WebbPolkadot } from '../webb-provider';

export class PolkadotVAnchorActions extends VAnchorActions<WebbPolkadot> {
  prepareTransaction(
    tx: Transaction<NewNotesTxResult>,
    payload: TransactionPayloadType,
    wrapUnwrapAssetId: string
  ): Promise<ParametersOfTransactMethod> | never {
    tx.next(TransactionState.PreparingTransaction, undefined);

    // If the wrapUnwrapAssetId is empty, we use the bridge fungible token
    if (!wrapUnwrapAssetId) {
      const activeBridge = this.inner.state.activeBridge;
      if (!activeBridge) {
        throw WebbError.from(WebbErrorCodes.NoActiveBridge);
      }

      const fungibleAsset = activeBridge.currency;
      const assetId = fungibleAsset.getAddress(this.inner.typedChainId);
      if (!assetId) {
        throw WebbError.from(WebbErrorCodes.NoFungibleTokenAvailable);
      }

      wrapUnwrapAssetId = assetId;
    }

    if (isVAnchorDepositPayload(payload)) {
      return this.prepareDepositTransaction(tx, payload, wrapUnwrapAssetId);
    } else if (isVAnchorWithdrawPayload(payload)) {
      return this.prepareWithdrawTransaction(tx, payload, wrapUnwrapAssetId);
    } else if (isVAnchorTransferPayload(payload)) {
      return this.prepareTransferTransaction(tx, payload, wrapUnwrapAssetId);
    }

    throw new Error('Unsupported payload type');
  }

  transactWithRelayer(
    activeRelayer: ActiveWebbRelayer,
    txArgs: ParametersOfTransactMethod,
    changeNotes: Note[]
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async transact(
    tx: Transaction<NewNotesTxResult>,
    treeId: string,
    inputs: Utxo[],
    outputs: Utxo[],
    fee: BN,
    refund: BN,
    recipient: string,
    relayer: string,
    wrapUnwrapAssetId: string,
    leavesMap: Record<string, Uint8Array[]>
  ) {
    // Get active bridge and currency fungible asset
    const activeBridge = this.inner.state.activeBridge;
    if (!activeBridge) {
      throw WebbError.from(WebbErrorCodes.NoActiveBridge);
    }

    const fungibleAsset = activeBridge.currency;
    const fungibleAssetId = fungibleAsset.getAddress(this.inner.typedChainId);
    if (!fungibleAssetId) {
      throw WebbError.from(WebbErrorCodes.NoFungibleTokenAvailable);
    }

    // Get active account
    const activeAccount = await this.inner.accounts.activeOrDefault;
    if (!activeAccount) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }

    // 16 inputs and 2 outputs
    inputs = await this.padUtxos(inputs, 16);
    outputs = await this.padUtxos(outputs, 2);

    const { extAmount, extData, vanchorProofData } =
      await this.setupTransaction(
        tx,
        inputs,
        outputs,
        fee,
        refund,
        recipient,
        relayer,
        wrapUnwrapAssetId,
        leavesMap,
        treeId
      );

    tx.next(
      TransactionState.SendingTransaction,
      'Sending transaction to vanchor'
    );

    // now we call the vanchor transact on substrate
    const polkadotTx = this.inner.txBuilder.buildWithoutNotification(
      [
        {
          method: 'transact',
          section: 'vAnchorBn254',
        },
      ],
      [[treeId, vanchorProofData, extData]]
    );

    const txHash = await polkadotTx.call(activeAccount.address);

    return {
      transactionHash: txHash,
    };
  }

  async isPairRegistered(
    treeId: string,
    account: string,
    pubkey: string
  ): Promise<boolean> {
    return true;
  }

  async register(
    treeId: string,
    account: string,
    pubkey: string
  ): Promise<boolean> {
    throw new Error('Attempted to register with Polkadot');
  }

  async syncNotesForKeypair(
    anchorAddress: string,
    owner: Keypair
  ): Promise<Note[]> {
    throw new Error('Attempted to sync notes for keypair with Polkadot');
  }

  /**
   * A function to get the leaf index of a leaf in the tree
   * @param leaf the leaf to search for
   * @param indexBeforeInsertion the tree index before insertion
   * @param addressOrTreeId the address or tree id of the tree
   */
  async getLeafIndex(
    leaf: Uint8Array,
    indexBeforeInsertion: number,
    addressOrTreeId: string
  ): Promise<bigint> {
    const treeId = Number(addressOrTreeId);
    const idx = await getLeafIndex(
      this.inner.api,
      leaf,
      indexBeforeInsertion,
      treeId
    );
    return BigInt(idx);
  }

  async getNextIndex(
    typedChainId: number,
    fungibleCurrencyId: number
  ): Promise<bigint> {
    const chain = this.inner.config.chains[typedChainId];
    const treeIdStr = this.inner.config.getAnchorAddress(
      fungibleCurrencyId,
      typedChainId
    );

    if (!chain || !treeIdStr) {
      throw WebbError.from(WebbErrorCodes.NoFungibleTokenAvailable);
    }

    const treeId = Number(treeIdStr);
    if (isNaN(treeId)) {
      throw WebbError.from(WebbErrorCodes.NoFungibleTokenAvailable);
    }

    const nextIdx = await this.inner.api.query.merkleTreeBn254.nextLeafIndex(
      treeId
    );
    return nextIdx.toBigInt();
  }

  async commitmentsSetup(notes: Note[], tx?: Transaction<NewNotesTxResult>) {
    if (notes.length === 0) {
      throw new Error('No notes to deposit');
    }

    const payload = notes[0];
    // In the withdraw/transfer flows, the destination chain is the current chain
    const destApi = this.inner.api;

    // Loop through the notes and populate the leaves map
    const leavesMap: Record<string, Uint8Array[]> = {};

    const notesLeaves = await Promise.all(
      notes.map((note) => this.fetchNoteLeaves(note, leavesMap, destApi, tx))
    );

    // Keep track of the leafindices for each note
    const leafIndices: number[] = [];

    // Create input UTXOs for convenience calculations
    const inputUtxos: Utxo[] = [];

    // calculate the sum of input notes (for calculating the change utxo)
    let sumInputNotes = new BN(0);

    notesLeaves.forEach(({ amount, leafIndex, utxo }) => {
      sumInputNotes = sumInputNotes.add(amount);
      leafIndices.push(leafIndex);
      inputUtxos.push(utxo);
    });

    const destTypedChainId = payload.note.targetChainId;
    // Populate the leaves for the destination if not already populated
    if (!leavesMap[destTypedChainId]) {
      const treeId = +payload.note.targetIdentifyingData;
      const palletId = await this.getVAnchorPalletId(destApi);
      const { chainId } = parseTypedChainId(+destTypedChainId);

      const resourceId = createSubstrateResourceId(
        chainId,
        treeId,
        String(palletId)
      );

      const leafStorage = await bridgeStorageFactory(resourceId.toString());
      const leaves = await this.inner.getVariableAnchorLeaves(
        destApi,
        leafStorage,
        {
          treeId,
          palletId,
        },
        tx?.cancelToken.abortSignal
      );

      leavesMap[destTypedChainId] = leaves.map((leaf) => {
        return hexToU8a(leaf);
      });
    }

    return {
      sumInputNotes,
      inputUtxos,
      leavesMap,
    };
  }

  private async prepareDepositTransaction(
    tx: Transaction<NewNotesTxResult>,
    payload: Note,
    wrapUnwrapAssetId: string
  ): Promise<ParametersOfTransactMethod> {
    const activeAccount = await this.inner.accounts.activeOrDefault;
    if (!activeAccount) {
      throw new Error('No active account');
    }

    await this.checkHasBalance(payload, wrapUnwrapAssetId);

    const address = activeAccount.address;
    const zeroBN = new BN(0);

    const depositUtxo = await utxoFromVAnchorNote(
      payload.note,
      +payload.note.index
    );
    const inputUtxos: Utxo[] = [];

    const leavesMap: Record<number, Uint8Array[]> = {};

    leavesMap[+payload.note.sourceChainId] = [];

    return [
      tx,
      payload.note.sourceIdentifyingData,
      inputUtxos,
      [depositUtxo],
      zeroBN,
      zeroBN,
      address,
      address,
      wrapUnwrapAssetId,
      leavesMap,
    ] satisfies ParametersOfTransactMethod;
  }

  private async prepareWithdrawTransaction(
    tx: Transaction<NewNotesTxResult>,
    payload: WithdrawTransactionPayloadType,
    wrapUnwrapAssetId: string
  ): Promise<ParametersOfTransactMethod> {
    const { changeUtxo, notes, recipient, refundAmount, feeAmount } = payload;

    const { inputUtxos, leavesMap } = await this.commitmentsSetup(notes, tx);

    const relayer =
      this.inner.relayerManager.activeRelayer?.beneficiary ?? ZERO_ADDRESS;

    return Promise.resolve([
      tx, // tx
      notes[0].note.targetIdentifyingData, // contractAddress
      inputUtxos, // inputs
      [changeUtxo], // outputs
      new BN(feeAmount.toString()), // fee
      new BN(refundAmount.toString()), // refund
      recipient, // recipient
      relayer, // relayer
      wrapUnwrapAssetId, // wrapUnwrapAssetId
      leavesMap, // leavesMap
    ]);
  }

  private async prepareTransferTransaction(
    tx: Transaction<NewNotesTxResult>,
    payload: TransferTransactionPayloadType,
    wrapUnwrapAssetId: string
  ): Promise<ParametersOfTransactMethod> {
    const { notes, changeUtxo, transferUtxo, feeAmount } = payload;

    const { inputUtxos, leavesMap } = await this.commitmentsSetup(notes, tx);

    const relayer =
      this.inner.relayerManager.activeRelayer?.beneficiary ?? ZERO_ADDRESS;

    // If no relayer is set, the fee is 0, otherwise it's the feeAmount
    const fee =
      relayer === ZERO_ADDRESS ? new BN(0) : new BN(feeAmount.toString());

    return Promise.resolve([
      tx, // tx
      notes[0].note.targetIdentifyingData, // contractAddress
      inputUtxos, // inputs
      [changeUtxo, transferUtxo], // outputs
      fee, // fee
      new BN(0), // refund
      ZERO_ADDRESS, // recipient
      relayer, // relayer
      wrapUnwrapAssetId, // wrapUnwrapAssetId
      leavesMap, // leavesMap
    ]);
  }

  private async checkHasBalance(payload: Note, wrapUnwrapAssetId: string) {
    // Check if the user has enough balance
    const balance = await firstValueFrom(
      this.inner.methods.chainQuery.tokenBalanceByAddress(wrapUnwrapAssetId)
    );

    const amount = formatUnits(payload.note.amount, payload.note.denomination);

    if (Number(balance) < Number(amount)) {
      this.emit('stateChange', TransactionState.Failed);
      await this.inner.noteManager?.removeNote(payload);
      throw new Error('Not enough balance');
    }
  }

  /**
   * Sets up a VAnchor transaction by generate the necessary inputs to the tx.
   * @param inputs a list of UTXOs that are either inside the tree or are dummy inputs
   * @param outputs a list of output UTXOs. Needs to have 2 elements.
   * @param fee transaction fee.
   * @param refund amount given as gas to withdraw address
   * @param recipient address to the recipient
   * @param relayer address to the relayer
   * @param wrapUnwrapAssetId address to the token being transacted. can be the empty string to use native token
   * @param leavesMap map from chainId to merkle leaves
   * @param treeId the treeId of the tree being used
   */
  private async setupTransaction(
    tx: Transaction<NewNotesTxResult>,
    inputs: Utxo[],
    outputs: Utxo[],
    fee: BN,
    refund: BN,
    recipient: string,
    relayer: string,
    wrapUnwrapAssetId: string,
    leavesMap: Record<string, Uint8Array[]>,
    treeId: string
  ) {
    if (wrapUnwrapAssetId.length === 0) {
      throw new Error('No asset id provided');
    }

    if (outputs.length !== 2) {
      throw new Error('Only two outputs are supported');
    }

    const api = this.inner.getProvider().api;

    const sourceTypedChainId = this.inner.typedChainId;
    const tree = await api.query.merkleTreeBn254.trees(treeId);
    const root = tree.unwrap().root.toHex();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const neighborRoots: string[] = await api.rpc.lt
      .getNeighborRoots(treeId)
      .then((roots: Codec) => roots.toHuman());

    const rootsSet = [hexToU8a(root), hexToU8a(neighborRoots[0])];
    const extAmount = this.getExtAmount(inputs, outputs, fee);

    // Pass the identifier for leaves alongside the proof input
    const leafIds: LeafIdentifier[] = [];

    for (const inputUtxo of inputs) {
      leafIds.push({
        index: inputUtxo.index ?? this.inner.state.defaultUtxoIndex,
        typedChainId: Number(inputUtxo.originChainId),
      });
    }

    const secret = randomAsU8a();
    const encryptedCommitments: [Uint8Array, Uint8Array] = [
      naclEncrypt(outputs[0].commitment, secret).encrypted,
      naclEncrypt(outputs[1].commitment, secret).encrypted,
    ];

    const fixturesList = new Map<string, FixturesStatus>();
    tx.next(TransactionState.FetchingFixtures, { fixturesList });

    const maxEdges = await this.inner.getVAnchorMaxEdges(treeId);

    // Proving key
    fixturesList.set('vanchor key', 'Waiting');
    const pkey = await this.inner.getZkVAnchorKey(maxEdges, inputs.length <= 2);
    fixturesList.set('vanchor key', 'Done');

    tx.next(TransactionState.GeneratingZk, undefined);

    // Asset must be a 4 bytes array (32 bits)
    const assetIdUInt32 = new Uint32Array([+wrapUnwrapAssetId]);
    const assetIdBytes = new Uint8Array(assetIdUInt32.buffer);

    // Relayer and recipient must be 32 bytes array (256 bits)
    const relayerBytes = hexToU8a(u8aToHex(decodeAddress(relayer)), 256);
    const recipientBytes = hexToU8a(u8aToHex(decodeAddress(recipient)), 256);

    if (!leavesMap[sourceTypedChainId]) {
      leavesMap[sourceTypedChainId] = [];
    }

    const proofInput: ProvingManagerSetupInput<'vanchor'> = {
      inputUtxos: inputs,
      leavesMap,
      leafIds,
      roots: rootsSet,
      chainId: sourceTypedChainId.toString(),
      output: [outputs[0], outputs[1]],
      encryptedCommitments,
      publicAmount: extAmount.toString(),
      provingKey: pkey,
      relayer: relayerBytes,
      recipient: recipientBytes,
      extAmount: extAmount.toString(),
      fee: fee.toString(),
      refund: refund.toString(),
      token: assetIdBytes,
    };

    console.log('proofInput', proofInput);

    const extData = {
      relayer: proofInput.relayer,
      recipient: proofInput.recipient,
      fee: proofInput.fee,
      refund: proofInput.refund,
      token: proofInput.token,
      extAmount: proofInput.extAmount,
      encryptedOutput1: u8aToHex(encryptedCommitments[0]),
      encryptedOutput2: u8aToHex(encryptedCommitments[1]),
    };

    console.log('extData', extData);

    const worker = this.inner.wasmFactory();
    const pm = new ArkworksProvingManager(worker);
    const data: VAnchorProof = await pm.prove('vanchor', proofInput);

    const vanchorProofData = {
      proof: `0x${data.proof}` as const,
      publicAmount: data.publicAmount,
      roots: rootsSet,
      inputNullifiers: data.inputUtxos.map(
        (input) => `0x${input.nullifier}` as const
      ),
      outputCommitments: data.outputUtxos.map((utxo) => utxo.commitment),
      extDataHash: data.extDataHash,
    };

    return {
      extData,
      extAmount: extData.extAmount,
      vanchorProofData,
    };
  }

  private async fetchNoteLeaves(
    note: Note,
    leavesMap: Record<string, Uint8Array[]>,
    destApi: ApiPromise,
    tx?: Transaction<NewNotesTxResult>
  ): Promise<{ leafIndex: number; utxo: Utxo; amount: BN }> | never {
    if (tx) {
      tx.next(TransactionState.FetchingLeaves, {
        end: undefined,
        currentRange: [0, 1],
        start: 0,
      });
    }

    const {
      amount,
      sourceChainId: sourceTypedChainId,
      sourceIdentifyingData: sourceTreeId,
      targetChainId: targetTypedChainId,
      targetIdentifyingData: targetTreeId,
    } = note.note;
    const amountBN = new BN(amount);

    // Fetch leaves of the source chain if not already fetched
    if (leavesMap[sourceTypedChainId] === undefined) {
      const sourceChainConfig = this.inner.config.chains[+sourceTypedChainId];
      const sourceChainEndpoint = sourceChainConfig.url;

      const api =
        String(this.inner.typedChainId) === sourceTypedChainId
          ? this.inner.api
          : await this.inner.getApiPromise(sourceChainEndpoint);

      const chainId = api.consts.linkableTreeBn254.chainIdentifier.toNumber();
      const palletId = await this.getVAnchorPalletId(api);

      const payload = {
        palletId,
        treeId: +sourceTreeId,
      };

      const resourceId = createSubstrateResourceId(
        chainId,
        payload.treeId,
        String(palletId)
      );

      const leafStorage = await bridgeStorageFactory(resourceId.toString());
      const leaves = await this.inner.getVariableAnchorLeaves(
        api,
        leafStorage,
        payload,
        tx?.cancelToken.abortSignal
      );
      leavesMap[sourceTypedChainId] = leaves.map((leaf) => {
        return hexToU8a(leaf);
      });
    }

    let destHistorySourceRoot: string;
    let treeHeight: BN;

    // Get the latest root that has been relayed from the source chain to the destination chain
    if (sourceTypedChainId === targetTypedChainId) {
      const destTree = (
        await destApi.query.merkleTreeBn254.trees(+targetTreeId)
      ).unwrapOr(null);

      if (!destTree) {
        throw WebbError.from(WebbErrorCodes.TreeNotFound);
      }

      destHistorySourceRoot = destTree.root.toHex();
      treeHeight = destTree.depth.toBn();
    } else {
      // Not implemented cross chain substrate <> substrate transactions yet.
      throw WebbError.from(WebbErrorCodes.NotImplemented);
    }

    // Fixed the root to be 32 bytes
    destHistorySourceRoot = toFixedHex(destHistorySourceRoot);

    // Remove leaves from the leaves map which have not yet been relayed
    const provingTree = MerkleTree.createTreeWithRoot(
      treeHeight.toNumber(),
      leavesMap[sourceTypedChainId].map((leaf) => u8aToHex(leaf)),
      destHistorySourceRoot
    );

    if (!provingTree) {
      // Outer try/catch will handle this
      throw new Error('Fetched leaves do not match bridged anchor state');
    }

    const provingLeaves = provingTree
      .elements()
      .map((el) => hexToU8a(toFixedHex(el.toHexString())));
    leavesMap[sourceTypedChainId] = provingLeaves;
    const commitment = generateCircomCommitment(note.note);
    const leafIndex = provingTree.getIndexByElement(commitment);
    // Validate that the commitment is in the tree
    if (leafIndex === -1) {
      // Outer try/catch will handle this
      throw new Error(
        'Commitment not found in tree, maybe waiting for relaying'
      );
    }

    const utxo = await utxoFromVAnchorNote(note.note, leafIndex);

    return {
      leafIndex,
      utxo,
      amount: amountBN,
    };
  }

  private async getVAnchorPalletId(api: ApiPromise): Promise<number> {
    const metadata = await api.rpc.state.getMetadata();
    return metadata.asLatest.pallets.findIndex((pallet) => {
      return pallet.name.toString() === 'VAnchorBn254';
    });
  }

  // https://github.com/webb-tools/protocol-solidity/blob/65d8e7ca7b7ba227d8cd97f2773fefc378655944/packages/anchors/src/Common.ts#L194-L198
  private getExtAmount(inputs: Utxo[], outputs: Utxo[], fee: BN) {
    return new BN(fee)
      .add(outputs.reduce((sum, x) => sum.add(new BN(x.amount)), new BN(0)))
      .sub(inputs.reduce((sum, x) => sum.add(new BN(x.amount)), new BN(0)));
  }

  // https://github.com/webb-tools/protocol-solidity/blob/65d8e7ca7b7ba227d8cd97f2773fefc378655944/packages/anchors/src/Common.ts#L247-L269
  private async padUtxos(utxos: Utxo[], maxLen: number): Promise<Utxo[]> {
    const typedChainId = this.inner.typedChainId;
    const randomKeypair = new Keypair();

    while (utxos.length !== 2 && utxos.length < maxLen) {
      utxos.push(
        await this.inner.generateUtxo({
          curve: 'Bn254',
          backend: this.inner.backend,
          chainId: typedChainId.toString(),
          originChainId: typedChainId.toString(),
          amount: '0',
          blinding: hexToU8a(randomBN(31).toHexString()),
          keypair: randomKeypair,
          index: this.inner.state.defaultUtxoIndex.toString(),
        })
      );
    }
    if (utxos.length !== 2 && utxos.length !== maxLen) {
      throw new Error('Invalid utxo length');
    }
    return utxos;
  }
}
