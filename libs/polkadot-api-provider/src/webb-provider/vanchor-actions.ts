import { decodeAddress } from '@polkadot/util-crypto';
import {
  ActiveWebbRelayer,
  FixturesStatus,
  NewNotesTxResult,
  ParametersOfTransactMethod,
  Transaction,
  TransactionPayloadType,
  TransactionState,
  VAnchorActions,
  isVAnchorDepositPayload,
  utxoFromVAnchorNote,
} from '@webb-tools/abstract-api-provider';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types';
import { IVariableAnchorExtData } from '@webb-tools/interfaces';
import {
  FIELD_SIZE,
  Keypair,
  LeafIdentifier,
  MerkleProof,
  MerkleTree,
  Note,
  Utxo,
  buildVariableWitnessCalculator,
  generateVariableWitnessInput,
  randomBN,
  toFixedHex,
} from '@webb-tools/sdk-core';
import { hexToU8a, u8aToHex } from '@webb-tools/utils';
import BN from 'bn.js';
import { firstValueFrom } from 'rxjs';

import * as snarkjs from 'snarkjs';

import { ZERO_BIG_INT } from '@webb-tools/dapp-config';
import assert from 'assert';
import { getLeafIndex } from '../mt-utils';
import { Groth16Proof, IVAnchorPublicInputs } from '../types';
import {
  ensureHex,
  getVAnchorExtDataHash,
  groth16ProofToBytes,
} from '../utils';
import { WebbPolkadot } from '../webb-provider';
import { formatUnits } from 'viem';

export class PolkadotVAnchorActions extends VAnchorActions<WebbPolkadot> {
  prepareTransaction(
    tx: Transaction<NewNotesTxResult>,
    payload: TransactionPayloadType,
    wrapUnwrapAssetId: string
  ): Promise<ParametersOfTransactMethod> | never {
    tx.next(TransactionState.PreparingTransaction, undefined);
    if (isVAnchorDepositPayload(payload)) {
      return this.prepareDepositTransaction(tx, payload, wrapUnwrapAssetId);
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
    fee: bigint,
    refund: bigint,
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

    const { extData, publicInputs } = await this.setupTransaction(
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
      [[treeId, publicInputs, extData]]
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

  // ------------------ Private ------------------

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
      ZERO_BIG_INT,
      ZERO_BIG_INT,
      address,
      address,
      wrapUnwrapAssetId,
      leavesMap,
    ] satisfies ParametersOfTransactMethod;
  }

  private async checkHasBalance(payload: Note, wrapUnwrapAssetId: string) {
    // Check if the user has enough balance
    const balance = await firstValueFrom(
      this.inner.methods.chainQuery.tokenBalanceByAddress(wrapUnwrapAssetId)
    );

    const amount = formatUnits(
      BigInt(payload.note.amount),
      +payload.note.denomination
    );

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
    fee: bigint,
    refund: bigint,
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
      .then((roots) => roots.toHuman());

    const rootsSet = [hexToU8a(root), hexToU8a(neighborRoots[0])];
    const feeBigInt = BigInt(fee.toString());
    const extAmount = this.getExtAmount(inputs, outputs, feeBigInt);

    const extAmountAbs = extAmount < 0 ? -extAmount : extAmount;
    if (extAmountAbs <= feeBigInt) {
      throw new Error('The amount must be greater than the fee');
    }

    // Pass the identifier for leaves alongside the proof input
    const leafIds: LeafIdentifier[] = inputs.map((input) => {
      const index = input.index ?? this.inner.state.defaultUtxoIndex;
      if (!input.index) {
        input.setIndex(index);
      }

      return { index, typedChainId: Number(input.originChainId) };
    });

    const encryptedCommitments: [Uint8Array, Uint8Array] = [
      hexToU8a(outputs[0].encrypt()),
      hexToU8a(outputs[1].encrypt()),
    ];

    const fixturesList = new Map<string, FixturesStatus>();
    tx.next(TransactionState.FetchingFixtures, { fixturesList });

    const maxEdges = await this.inner.getVAnchorMaxEdges(treeId);

    // Proving key
    fixturesList.set('vanchor key', 'Waiting');
    const { zkey, wasm } = await this.inner.getZkFixtures(
      maxEdges,
      inputs.length <= 2
    );
    fixturesList.set('vanchor key', 'Done');

    tx.next(TransactionState.GeneratingZk, undefined);

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
      u8aToHex(encryptedCommitments[1])
    );

    const proofInputs = await this.generateProofInputs(
      treeId,
      rootsSet.map((r) => BigInt(u8aToHex(r))),
      BigInt(sourceTypedChainId),
      inputs,
      outputs,
      publicAmount,
      feeBigInt,
      extDataHash,
      leavesMap
    );

    console.log('proofInputs', proofInputs);

    const witness = await this.getSnarkJsWitness(proofInputs, wasm);

    const proof = await this.getSnarkJsProof(zkey, witness);

    const publicInputs = await this.generatePublicInputs(
      proof,
      rootsSet,
      inputs,
      outputs,
      publicAmount,
      extDataHash
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
    extDataHash: bigint
  ): Promise<IVAnchorPublicInputs> {
    const proofBytes = await groth16ProofToBytes(proof);
    const publicAmountHex = ensureHex(toFixedHex(publicAmount, 32));
    const extDataHashHex = ensureHex(toFixedHex(extDataHash));

    const inputNullifiers = inputs.map((x) =>
      ensureHex(toFixedHex('0x' + x.nullifier))
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
    encryptedOutput2: string
  ): {
    extData: IVariableAnchorExtData;
    extDataHash: bigint;
  } {
    // i128 is a signed 128-bit integer
    const extAmountBN = new BN(extAmount.toString()).toTwos(128).toString();
    const feeBN = new BN(fee.toString()).toTwos(128).toString();
    const refundBN = new BN(refund.toString()).toTwos(128).toString();

    const extData: IVariableAnchorExtData = {
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
    leavesMap?: Uint8Array[]
  ): MerkleProof {
    const tree = new MerkleTree(levels, leavesMap);

    let inputMerklePathIndices: number[];
    let inputMerklePathElements: BigNumber[];

    if (Number(input.amount) > 0) {
      if (input.index === undefined) {
        throw new Error(
          `Input commitment ${u8aToHex(input.commitment)} index was not set`
        );
      }
      if (input.index < 0) {
        throw new Error(
          `Input commitment ${u8aToHex(input.commitment)} index should be >= 0`
        );
      }
      if (leavesMap === undefined) {
        const path = tree.path(input.index);
        inputMerklePathIndices = path.pathIndices;
        inputMerklePathElements = path.pathElements;
      } else {
        const mt = new MerkleTree(levels, leavesMap);
        const path = mt.path(input.index);
        inputMerklePathIndices = path.pathIndices;
        inputMerklePathElements = path.pathElements;
      }
    } else {
      inputMerklePathIndices = new Array(tree.levels).fill(0);
      inputMerklePathElements = new Array(tree.levels).fill(0);
    }

    return {
      element: BigNumber.from(u8aToHex(input.commitment)),
      pathElements: inputMerklePathElements,
      pathIndices: inputMerklePathIndices,
      merkleRoot: tree.root(),
    };
  }

  private async generateProofInputs(
    treeId: string,
    roots: bigint[],
    typedChainId: bigint,
    inputUtxos: Utxo[],
    outputUtxos: Utxo[],
    publicAmount: bigint,
    fee: bigint,
    extDataHash: bigint,
    leavesMap: Record<string, Uint8Array[]>
  ) {
    const levels = await this.inner.getVAnchorLevels(treeId);

    let vanchorMerkleProof: MerkleProof[];
    if (Object.keys(leavesMap).length === 0) {
      vanchorMerkleProof = inputUtxos.map((u) =>
        this.getMerkleProof(levels, u)
      );
    } else {
      const treeElements = leavesMap[typedChainId.toString()];
      vanchorMerkleProof = inputUtxos.map((u) =>
        this.getMerkleProof(levels, u, treeElements)
      );
    }

    const witnessInput = generateVariableWitnessInput(
      roots,
      typedChainId,
      inputUtxos,
      outputUtxos,
      publicAmount,
      fee,
      extDataHash,
      vanchorMerkleProof
    );

    return witnessInput;
  }

  private async getSnarkJsWitness(
    witnessInput: any,
    circuitWasm: Buffer
  ): Promise<Uint8Array> {
    const witnessCalculator = await buildVariableWitnessCalculator(
      circuitWasm,
      0
    );
    return witnessCalculator.calculateWTNSBin(witnessInput, 0);
  }

  private async getSnarkJsProof(
    zkey: Uint8Array,
    witness: Uint8Array
  ): Promise<Groth16Proof> {
    const proofOutput: Groth16Proof = await snarkjs.groth16.prove(
      zkey,
      witness
    );

    const proof = proofOutput.proof;
    const publicSignals = proofOutput.publicSignals;

    const vKey = await snarkjs.zKey.exportVerificationKey(zkey);

    const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);

    assert.strictEqual(isValid, true, 'Invalid proof');

    return proofOutput;
  }

  private getExtAmount(inputs: Utxo[], outputs: Utxo[], fee: bigint) {
    const outAmount = outputs.reduce(
      (sum, x) => sum + BigInt(x.amount),
      ZERO_BIG_INT
    );
    const inAmount = inputs.reduce(
      (sum, x) => sum + BigInt(x.amount),
      ZERO_BIG_INT
    );

    return fee + outAmount - inAmount;
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
