import { Codec } from '@polkadot/types/types';
import { decodeAddress } from '@polkadot/util-crypto';
import {
  ActiveWebbRelayer,
  CMDSwitcher,
  ParametersOfTransactMethod,
  RelayedChainInput,
  RelayedWithdrawResult,
  TransactionPayloadType,
  TransferTransactionPayloadType,
  VAnchorActions,
  WithdrawRelayerArgs,
  WithdrawTransactionPayloadType,
  generateCircomCommitment,
  isVAnchorDepositPayload,
  isVAnchorTransferPayload,
  isVAnchorWithdrawPayload,
  utxoFromVAnchorNote,
} from '@webb-tools/abstract-api-provider';
import {
  ApiConfig,
  createSubstrateResourceId,
  ensureHex,
} from '@webb-tools/dapp-config';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types';
import {
  ChainType,
  FIELD_SIZE,
  Keypair,
  MerkleTree,
  Note,
  ResourceId,
  Utxo,
  buildVariableWitnessCalculator,
  toFixedHex,
} from '@webb-tools/sdk-core';
import BN from 'bn.js';
import { firstValueFrom } from 'rxjs';
import { groth16, zKey } from 'snarkjs';

import { ApiPromise } from '@polkadot/api';
import { hexToU8a, u8aToHex } from '@polkadot/util';
import type { HexString } from '@polkadot/util/types';
import { NeighborEdge } from '@webb-tools/abstract-api-provider/vanchor/types';
import { bridgeStorageFactory } from '@webb-tools/browser-utils';
import { ZERO_BIG_INT } from '@webb-tools/dapp-config';
import { AddressType } from '@webb-tools/dapp-config/types';
import assert from 'assert';
import { formatUnits, zeroAddress } from 'viem';
import { getLeafIndex } from '../mt-utils';
import { Groth16Proof, IVAnchorPublicInputs } from '../types';
import { getVAnchorExtDataHash, groth16ProofToBytes } from '../utils';
import { WebbPolkadot } from '../webb-provider';

export class PolkadotVAnchorActions extends VAnchorActions<
  'polkadot',
  WebbPolkadot
> {
  static async getNextIndex(
    apiConfig: ApiConfig,
    typedChainId: number,
    fungibleCurrencyId: number,
  ): Promise<bigint> {
    const chain = apiConfig.chains[typedChainId];
    const treeIdStr = apiConfig.getAnchorIdentifier(
      fungibleCurrencyId,
      typedChainId,
    );

    if (!chain || !treeIdStr) {
      throw WebbError.from(WebbErrorCodes.NoFungibleTokenAvailable);
    }

    const endpoints = chain.rpcUrls.default.webSocket;
    if (!endpoints || endpoints.length === 0) {
      throw WebbError.from(WebbErrorCodes.NoEndpointsConfigured);
    }

    const api = await WebbPolkadot.getApiPromise(endpoints[0]);
    const treeId = Number(treeIdStr);
    if (isNaN(treeId)) {
      throw WebbError.from(WebbErrorCodes.NoFungibleTokenAvailable);
    }

    const nextIdx = await api.query.merkleTreeBn254.nextLeafIndex(treeId);

    return BigInt(nextIdx.toHex());
  }

  prepareTransaction(
    payload: TransactionPayloadType,
    wrapUnwrapAssetId: string,
  ): Promise<ParametersOfTransactMethod<'polkadot'>> | never {
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
      return this.prepareDepositTransaction(payload, wrapUnwrapAssetId);
    } else if (isVAnchorWithdrawPayload(payload)) {
      return this.prepareWithdrawTransaction(payload, wrapUnwrapAssetId);
    } else if (isVAnchorTransferPayload(payload)) {
      return this.prepareTransferTransaction(payload, wrapUnwrapAssetId);
    }

    throw new Error('Unsupported payload type');
  }

  async transactWithRelayer(
    activeRelayer: ActiveWebbRelayer,
    txArgs: ParametersOfTransactMethod<'polkadot'>,
    _changeNotes: Note[],
  ): Promise<HexString> {
    const [anchorId, inputUtxos, outputUtxos, ...restArgs] = txArgs;

    const relayedVAnchorWithdraw = await activeRelayer.initWithdraw('vAnchor');

    const chainId = parseInt(
      this.inner.api.consts.linkableTreeBn254.chainIdentifier.toHex(),
    );

    const chainInfo: RelayedChainInput = {
      baseOn: 'substrate',
      contractAddress: anchorId,
      endpoint: '',
      name: chainId.toString(),
    };

    const setupTransactionArgs = [
      inputUtxos,
      outputUtxos,
      // Ignore the override option if provided
      ...(restArgs.length === 6 ? restArgs : restArgs.slice(0, -1)),
      anchorId,
    ] as Parameters<typeof this.setupTransaction>;

    const { publicInputs: proofData } = await this.setupTransaction(
      ...setupTransactionArgs,
    );

    const relayTxPayload = relayedVAnchorWithdraw.generateWithdrawRequest<
      typeof chainInfo,
      'vAnchor'
    >(chainInfo, {
      chainId,
      id: +anchorId,
      proofData: {
        ...proofData,
        extensionRoots: [],
      },
    } satisfies WithdrawRelayerArgs<'substrate', CMDSwitcher<'substrate'>>);

    // Subscribe to the relayer's transaction status.
    relayedVAnchorWithdraw.watcher.subscribe(async ([results]) => {
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

    console.log('Relay tx payload', relayTxPayload);

    // Send the transaction to the relayer.
    relayedVAnchorWithdraw.send(relayTxPayload, chainId);

    const [, txHash = ''] = await relayedVAnchorWithdraw.await();
    return ensureHex(txHash);
  }

  async transact(
    treeId: string,
    inputs: Utxo[],
    outputs: Utxo[],
    fee: bigint,
    refund: bigint,
    recipient: string,
    relayer: string,
    wrapUnwrapAssetId: string,
    leavesMap: Record<string, Uint8Array[]>,
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

    const { extData, publicInputs } = await this.setupTransaction(
      inputs,
      outputs,
      fee,
      refund,
      recipient,
      relayer,
      wrapUnwrapAssetId,
      leavesMap,
      treeId,
    );

    // now we call the vanchor transact on substrate
    const polkadotTx = this.inner.txBuilder.buildWithoutNotification(
      [
        {
          method: 'transact',
          section: 'vAnchorBn254',
        },
      ],
      [[treeId, publicInputs, extData]],
    );

    const txHash = await polkadotTx.call(activeAccount.address);

    return ensureHex(txHash);
  }

  async waitForFinalization(_hash: AddressType): Promise<void> {
    throw WebbError.from(WebbErrorCodes.NotImplemented);
  }

  async isPairRegistered(
    _treeId: string,
    _account: string,
    _pubkey: string,
  ): Promise<boolean> {
    throw WebbError.from(WebbErrorCodes.NotImplemented);
  }

  async register(
    _treeId: string,
    _account: string,
    _pubkey: string,
  ): Promise<boolean> {
    throw WebbError.from(WebbErrorCodes.NotImplemented);
  }

  async syncNotesForKeypair(
    _anchorAddress: string,
    _owner: Keypair,
    _startingBlock?: bigint,
    _abortSignal?: AbortSignal,
  ): Promise<Note[]> {
    throw WebbError.from(WebbErrorCodes.NotImplemented);
  }

  /**
   * A function to get the leaf index of a leaf in the tree
   * @param leaf the leaf to search for
   * @param indexBeforeInsertion the tree index before insertion
   * @param addressOrTreeId the address or tree id of the tree
   */
  async getLeafIndex(
    _txHash: string,
    note: Note,
    indexBeforeInsertion: number,
    addressOrTreeId: string,
  ): Promise<bigint> {
    const leaf = note.getLeaf();
    const treeId = Number(addressOrTreeId);
    const idx = await getLeafIndex(
      this.inner.api,
      leaf,
      indexBeforeInsertion,
      treeId,
    );
    return BigInt(idx);
  }

  async getNextIndex(
    typedChainId: number,
    fungibleCurrencyId: number,
  ): Promise<bigint> {
    const chain = this.inner.config.chains[typedChainId];
    const treeIdStr = this.inner.config.getAnchorIdentifier(
      fungibleCurrencyId,
      typedChainId,
    );

    if (!chain || !treeIdStr) {
      throw WebbError.from(WebbErrorCodes.NoFungibleTokenAvailable);
    }

    const treeId = Number(treeIdStr);
    if (isNaN(treeId)) {
      throw WebbError.from(WebbErrorCodes.NoFungibleTokenAvailable);
    }

    const nextIdx =
      await this.inner.api.query.merkleTreeBn254.nextLeafIndex(treeId);
    return BigInt(nextIdx.toHex());
  }

  async getResourceId(
    treeId: string,
    chainId: number,
    _: ChainType,
  ): Promise<ResourceId> {
    const palletId = await this.getVAnchorPalletId(this.inner.api);
    return createSubstrateResourceId(chainId, +treeId, palletId.toString());
  }

  async commitmentsSetup(notes: Note[]) {
    if (notes.length === 0) {
      throw new Error('No notes to deposit');
    }

    // In the withdraw/transfer flows, the destination chain is the current chain
    const destApi = this.inner.api;

    // Loop through the notes and populate the leaves map
    const leavesMap: Record<string, Uint8Array[]> = {};

    const notesLeaves = await Promise.all(
      notes.map((note) => this.fetchNoteLeaves(note, leavesMap, destApi)),
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

    return {
      sumInputNotes,
      inputUtxos,
      leavesMap,
    };
  }

  async getLatestNeighborEdges(
    _fungibleId: number,
    _typedChainId?: number | undefined,
  ): Promise<readonly NeighborEdge[]> {
    throw WebbError.from(WebbErrorCodes.NotImplemented);
  }

  async validateInputNotes(
    _notes: readonly Note[],
    _typedChainId: number,
    _fungibleId: number,
  ): Promise<boolean> {
    throw WebbError.from(WebbErrorCodes.NotImplemented);
  }

  // ------------------ Private ------------------

  private async prepareDepositTransaction(
    payload: Note,
    wrapUnwrapAssetId: string,
  ): Promise<ParametersOfTransactMethod<'polkadot'>> {
    const activeAccount = await this.inner.accounts.activeOrDefault;
    if (!activeAccount) {
      throw new Error('No active account');
    }

    await this.checkHasBalance(payload, wrapUnwrapAssetId);

    const address = activeAccount.address;

    const depositUtxo = await utxoFromVAnchorNote(
      payload.note,
      +payload.note.index,
    );
    const inputUtxos: Utxo[] = [];

    const leavesMap: Record<number, Uint8Array[]> = {};

    leavesMap[+payload.note.sourceChainId] = [];

    return [
      payload.note.sourceIdentifyingData,
      inputUtxos,
      [depositUtxo],
      ZERO_BIG_INT,
      ZERO_BIG_INT,
      address,
      address,
      wrapUnwrapAssetId,
      leavesMap,
    ] satisfies ParametersOfTransactMethod<'polkadot'>;
  }

  private async prepareWithdrawTransaction(
    payload: WithdrawTransactionPayloadType,
    wrapUnwrapAssetId: string,
  ): Promise<ParametersOfTransactMethod<'polkadot'>> {
    const { changeUtxo, notes, recipient, refundAmount, feeAmount } = payload;

    const { inputUtxos, leavesMap } = await this.commitmentsSetup(notes);

    const relayer =
      this.inner.relayerManager.activeRelayer?.beneficiary ?? zeroAddress;

    // Fee only applies if relayer is set
    const actualFee = relayer === zeroAddress ? ZERO_BIG_INT : feeAmount;

    // Refund only applies if relayer is set
    const actualRefund = relayer === zeroAddress ? ZERO_BIG_INT : refundAmount;

    return Promise.resolve([
      notes[0].note.targetIdentifyingData, // contractAddress
      inputUtxos, // inputs
      [changeUtxo], // outputs
      actualFee, // fee
      actualRefund, // refund
      recipient, // recipient
      relayer, // relayer
      wrapUnwrapAssetId, // wrapUnwrapAssetId
      leavesMap, // leavesMap
    ]);
  }

  private async prepareTransferTransaction(
    payload: TransferTransactionPayloadType,
    wrapUnwrapAssetId: string,
  ): Promise<ParametersOfTransactMethod<'polkadot'>> {
    const { notes, changeUtxo, transferUtxo, feeAmount } = payload;

    const { inputUtxos, leavesMap } = await this.commitmentsSetup(notes);

    const relayer =
      this.inner.relayerManager.activeRelayer?.beneficiary ?? zeroAddress;

    // Fee only applies if relayer is set
    const actualFee = relayer === zeroAddress ? ZERO_BIG_INT : feeAmount;
    return Promise.resolve([
      notes[0].note.targetIdentifyingData, // contractAddress
      inputUtxos, // inputs
      [changeUtxo, transferUtxo], // outputs
      actualFee, // fee
      ZERO_BIG_INT, // refund
      zeroAddress, // recipient
      relayer, // relayer
      wrapUnwrapAssetId, // wrapUnwrapAssetId
      leavesMap, // leavesMap
    ]);
  }

  private async checkHasBalance(payload: Note, wrapUnwrapAssetId: string) {
    // Check if the user has enough balance
    const balance = await firstValueFrom(
      this.inner.methods.chainQuery.tokenBalanceByAddress(wrapUnwrapAssetId),
    );

    const amount = formatUnits(
      BigInt(payload.note.amount),
      +payload.note.denomination,
    );

    if (Number(balance) < Number(amount)) {
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
    inputs: Utxo[],
    outputs: Utxo[],
    fee: bigint,
    refund: bigint,
    recipient: string,
    relayer: string,
    wrapUnwrapAssetId: string,
    leavesMap: Record<string, Uint8Array[]>,
    treeId: string,
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
    const root = (tree as any).unwrap().root.toHex();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const neighborRoots: string[] = await api.rpc.lt
      .getNeighborRoots(treeId)
      .then((roots: Codec) => roots.toHuman());

    const rootsSet = [hexToU8a(root), ...neighborRoots.map((r) => hexToU8a(r))];
    const feeBigInt = BigInt(fee.toString());
    const extAmount = this.getExtAmount(inputs, outputs, feeBigInt);

    const encryptedCommitments: [Uint8Array, Uint8Array] = [
      hexToU8a(outputs[0].encrypt()),
      hexToU8a(outputs[1].encrypt()),
    ];

    const fieldSize = FIELD_SIZE.toBigInt();
    const publicAmount = (extAmount - feeBigInt + fieldSize) % fieldSize;

    const { extData, extDataHash } = this.generateExtData(
      recipient,
      relayer,
      extAmount,
      feeBigInt,
      BigInt(refund.toString()),
      wrapUnwrapAssetId,
      u8aToHex(encryptedCommitments[0]),
      u8aToHex(encryptedCommitments[1]),
    );

    const proofInputs = await this.generateProofInputs(
      treeId,
      rootsSet.map((r) => BigInt(u8aToHex(r))),
      BigInt(sourceTypedChainId),
      inputs,
      outputs,
      extAmount,
      feeBigInt,
      extDataHash,
      leavesMap,
    );

    const wasm = Buffer.from('');
    const zkey = new Uint8Array();

    const witness = await this.getSnarkJsWitness(proofInputs, wasm);

    const proof = await this.getSnarkJsProof(zkey, witness);

    const publicInputs = await this.generatePublicInputs(
      proof,
      rootsSet,
      inputs,
      outputs,
      publicAmount,
      extDataHash,
    );

    // For Substrate, specifically, we need the extAmount to not be in hex value,
    // since substrate does not understand -ve hex values.
    // Hence, we convert it to a string.
    extData.extAmount = extAmount.toString();

    return {
      extData,
      extAmount: extData.extAmount,
      publicInputs,
    };
  }

  private async generatePublicInputs(
    proof: Groth16Proof,
    roots: Uint8Array[],
    inputs: Utxo[],
    outputs: Utxo[],
    publicAmount: bigint,
    extDataHash: bigint,
  ): Promise<IVAnchorPublicInputs> {
    const proofBytes = await groth16ProofToBytes(proof);
    const publicAmountHex = ensureHex(toFixedHex(publicAmount, 32));
    const extDataHashHex = ensureHex(toFixedHex(extDataHash));

    const inputNullifiers = inputs.map((x) =>
      ensureHex(toFixedHex('0x' + x.nullifier)),
    );

    const outputCommitments = [
      ensureHex(toFixedHex(u8aToHex(outputs[0].commitment))),
      ensureHex(toFixedHex(u8aToHex(outputs[1].commitment))),
    ];

    const rootsHex = roots.map((r) => ensureHex(toFixedHex(u8aToHex(r))));

    return {
      proof: ensureHex(u8aToHex(proofBytes)),
      roots: rootsHex,
      inputNullifiers,
      outputCommitments: [outputCommitments[0], outputCommitments[1]],
      publicAmount: publicAmountHex,
      extDataHash: extDataHashHex,
    };
  }

  private generateExtData(
    recipient: string,
    relayer: string,
    extAmount: bigint,
    fee: bigint,
    refund: bigint,
    wrapUnwrapToken: string,
    encryptedOutput1: string,
    encryptedOutput2: string,
  ) {
    // i128 is a signed 128-bit integer
    const extAmountBN = new BN(extAmount.toString()).toTwos(128).toString();
    const feeBN = new BN(fee.toString()).toTwos(128).toString();
    const refundBN = new BN(refund.toString()).toTwos(128).toString();

    const extData = {
      // For recipient, since it is an AccountId (32 bytes) we use toFixedHex to pad it to 32 bytes.
      recipient: toFixedHex(u8aToHex(decodeAddress(recipient))),
      // For relayer, since it is an AccountId (32 bytes) we use toFixedHex to pad it to 32 bytes.
      relayer: toFixedHex(u8aToHex(decodeAddress(relayer))),
      // For extAmount, since it is an Amount (i128) it should be 16 bytes
      extAmount: toFixedHex(extAmountBN, 16),
      // For fee, since it is a Balance (u128) it should be 16 bytes
      fee: toFixedHex(feeBN, 16),
      // For refund, since it is a Balance (u128) it should be 16 bytes
      refund: toFixedHex(refundBN, 16),
      // For token, since it is an AssetId (u32) it should be 4 bytes
      token: toFixedHex(wrapUnwrapToken, 4),
      encryptedOutput1,
      encryptedOutput2,
    };

    const extDataHash = getVAnchorExtDataHash(extData);

    return { extData, extDataHash };
  }

  private getMerkleProof(
    levels: number,
    input: Utxo,
    leavesMap?: Uint8Array[],
  ) {
    const tree = new MerkleTree(levels, leavesMap);

    let inputMerklePathIndices: number[];
    let inputMerklePathElements: bigint[];

    if (Number(input.amount) > 0) {
      if (input.index === undefined) {
        throw new Error(
          `Input commitment ${u8aToHex(input.commitment)} index was not set`,
        );
      }
      if (input.index < 0) {
        throw new Error(
          `Input commitment ${u8aToHex(input.commitment)} index should be >= 0`,
        );
      }
      if (leavesMap === undefined) {
        const path = tree.path(input.index);
        inputMerklePathIndices = path.pathIndices;
        inputMerklePathElements = path.pathElements.map((x) => x.toBigInt());
      } else {
        const mt = new MerkleTree(levels, leavesMap);
        const path = mt.path(input.index);
        inputMerklePathIndices = path.pathIndices;
        inputMerklePathElements = path.pathElements.map((x) => x.toBigInt());
      }
    } else {
      inputMerklePathIndices = new Array(tree.levels).fill(0);
      inputMerklePathElements = new Array(tree.levels).fill(0);
    }

    return {
      element: BigInt(u8aToHex(input.commitment)),
      pathElements: inputMerklePathElements,
      pathIndices: inputMerklePathIndices,
      merkleRoot: tree.root().toBigInt(),
    };
  }

  private async generateProofInputs(
    treeId: string,
    roots: bigint[],
    typedChainId: bigint,
    inputUtxos: Utxo[],
    outputUtxos: Utxo[],
    extAmount: bigint,
    fee: bigint,
    extDataHash: bigint,
    leavesMap: Record<string, Uint8Array[]>,
  ) {
    const levels = await this.inner.getVAnchorLevels(treeId);

    let vanchorMerkleProof: Array<ReturnType<typeof this.getMerkleProof>>;
    if (Object.keys(leavesMap).length === 0) {
      vanchorMerkleProof = inputUtxos.map((u) =>
        this.getMerkleProof(levels, u),
      );
    } else {
      const treeElements = leavesMap[typedChainId.toString()];
      vanchorMerkleProof = inputUtxos.map((u) =>
        this.getMerkleProof(levels, u, treeElements),
      );
    }

    const vanchorMerkleProofs = vanchorMerkleProof.map((proof) => ({
      pathIndex: MerkleTree.calculateIndexFromPathIndices(proof.pathIndices),
      pathElements: proof.pathElements,
    }));

    const fieldSize = FIELD_SIZE.toBigInt();

    const input = {
      roots: roots.map((x) => x.toString()),
      chainID: typedChainId.toString(),
      inputNullifier: inputUtxos.map((x) => ensureHex(x.nullifier)),
      outputCommitment: outputUtxos.map((x) =>
        BigInt(u8aToHex(x.commitment)).toString(),
      ),
      publicAmount: ((extAmount - fee + fieldSize) % fieldSize).toString(),
      extDataHash: extDataHash.toString(),
      // data for 2 transaction inputs
      inAmount: inputUtxos.map((x) => x.amount.toString()),
      inPrivateKey: inputUtxos.map((x) => ensureHex(x.secret_key)),
      inBlinding: inputUtxos.map((x) =>
        BigInt(ensureHex(x.blinding)).toString(),
      ),
      inPathIndices: vanchorMerkleProofs.map((x) => x.pathIndex),
      inPathElements: vanchorMerkleProofs.map((x) => x.pathElements),
      // data for 2 transaction outputs
      outChainID: outputUtxos.map((x) => x.chainId),
      outAmount: outputUtxos.map((x) => x.amount.toString()),
      outPubkey: outputUtxos.map((x) =>
        BigInt(x.getKeypair().getPubKey()).toString(),
      ),
      outBlinding: outputUtxos.map((x) =>
        BigInt(ensureHex(x.blinding)).toString(),
      ),
    };

    return input;
  }

  private async getSnarkJsWitness(
    witnessInput: any,
    circuitWasm: Buffer,
  ): Promise<Uint8Array> {
    const witnessCalculator = await buildVariableWitnessCalculator(
      circuitWasm,
      0,
    );
    return witnessCalculator.calculateWTNSBin(witnessInput, 0);
  }

  private async getSnarkJsProof(
    zkey: Uint8Array,
    witness: Uint8Array,
  ): Promise<Groth16Proof> {
    const proofOutput: Groth16Proof = await groth16.prove(zkey, witness);

    const proof = proofOutput.proof;
    const publicSignals = proofOutput.publicSignals;

    const vKey = await zKey.exportVerificationKey(zkey);

    const isValid = await groth16.verify(vKey, publicSignals, proof);

    assert.strictEqual(isValid, true, 'Invalid proof');

    return proofOutput;
  }

  private async fetchNoteLeaves(
    note: Note,
    leavesMap: Record<string, Uint8Array[]>,
    destApi: ApiPromise,
  ): Promise<{ leafIndex: number; utxo: Utxo; amount: BN }> | never {
    const {
      amount,
      sourceChainId: sourceTypedChainId,
      sourceIdentifyingData: sourceTreeId,
      targetChainId: targetTypedChainId,
      targetIdentifyingData: targetTreeId,
    } = note.note;

    const amountBN = new BN(amount);

    let destRelayedRoot: string;
    let treeHeight: number;

    // Get the latest root that has been relayed from the source chain to the destination chain
    if (sourceTypedChainId === targetTypedChainId) {
      const destTree = (
        (await destApi.query.merkleTreeBn254.trees(+targetTreeId)) as any
      ).unwrapOr(null);

      if (!destTree) {
        throw WebbError.from(WebbErrorCodes.AnchorIdNotFound);
      }

      destRelayedRoot = destTree.root.toHex();
      treeHeight = destTree.depth.toNumber();
    } else {
      // Not implemented cross chain substrate <> evm transactions yet.
      throw WebbError.from(WebbErrorCodes.NotImplemented);
    }

    // Fixed the root to be 32 bytes
    destRelayedRoot = toFixedHex(destRelayedRoot);

    // The commitment of the note
    const commitment = await generateCircomCommitment(note.note);

    // Fetch leaves of the source chain if not already fetched
    if (!leavesMap[sourceTypedChainId]) {
      const sourceChainConfig = this.inner.config.chains[+sourceTypedChainId];
      const sourceChainEndpoint =
        sourceChainConfig.rpcUrls.default.webSocket?.[0];

      if (!sourceChainEndpoint) {
        throw WebbError.from(WebbErrorCodes.NoEndpointsConfigured);
      }

      const api =
        String(this.inner.typedChainId) === sourceTypedChainId
          ? this.inner.api
          : await WebbPolkadot.getApiPromise(sourceChainEndpoint);

      const chainId = parseInt(
        api.consts.linkableTreeBn254.chainIdentifier.toHex(),
      );
      const palletId = await this.getVAnchorPalletId(api);

      const resourceId = createSubstrateResourceId(
        chainId,
        +sourceTreeId,
        String(palletId),
      );

      const leafStorage = await bridgeStorageFactory(resourceId.toString());
      const { provingLeaves } = await this.inner.getVAnchorLeaves(
        api,
        leafStorage,
        {
          treeHeight,
          targetRoot: destRelayedRoot,
          commitment,
          palletId,
          treeId: +sourceTreeId,
        },
      );

      leavesMap[sourceTypedChainId] = provingLeaves.map((leaf) => {
        return hexToU8a(leaf);
      });
    }

    // Validate that the commitment is in the tree
    const utxo = await utxoFromVAnchorNote(note.note);

    return {
      leafIndex: -1,
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

  private getExtAmount(inputs: Utxo[], outputs: Utxo[], fee: bigint) {
    const outAmount = outputs.reduce(
      (sum, x) => sum + BigInt(x.amount),
      ZERO_BIG_INT,
    );
    const inAmount = inputs.reduce(
      (sum, x) => sum + BigInt(x.amount),
      ZERO_BIG_INT,
    );

    return fee + outAmount - inAmount;
  }
}
