import { decodeAddress, naclEncrypt, randomAsU8a } from '@polkadot/util-crypto';
import { HexString } from '@polkadot/util/types';
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
  generateWithdrawProofCallData,
  randomBN,
  toFixedHex,
} from '@webb-tools/sdk-core';
import { hexToU8a, u8aToHex } from '@webb-tools/utils';
import BN from 'bn.js';
import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { firstValueFrom } from 'rxjs';

import * as snarkjs from 'snarkjs';

import assert from 'assert';
import { getLeafIndex } from '../mt-utils';
import { ensureHex, getVAnchorExtDataHash } from '../utils';
import { WebbPolkadot } from '../webb-provider';

export interface IVAnchorPublicInputs {
  proof: HexString;
  roots: Uint8Array[];
  extensionRoots: HexString;
  inputNullifiers: HexString[];
  outputCommitments: [HexString, HexString];
  publicAmount: HexString;
  extDataHash: HexString;
}

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

    const { extData, vanchorProofData } = await this.setupTransaction(
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
      .then((roots) => roots.toHuman());

    const rootsSet = [hexToU8a(root), hexToU8a(neighborRoots[0])];
    const feeBigInt = BigInt(fee.toString());
    const extAmount = this.getExtAmount(inputs, outputs, feeBigInt);

    // Pass the identifier for leaves alongside the proof input
    const leafIds: LeafIdentifier[] = inputs.map((input) => {
      const index = input.index ?? this.inner.state.defaultUtxoIndex;
      if (!input.index) {
        input.setIndex(index);
      }

      return { index, typedChainId: Number(input.originChainId) };
    });

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
    const { zkey, wasm } = await this.inner.getZkFixtures(
      maxEdges,
      inputs.length <= 2
    );
    fixturesList.set('vanchor key', 'Done');

    tx.next(TransactionState.GeneratingZk, undefined);

    const fieldSize = FIELD_SIZE.toBigInt();
    const publicAmount = (extAmount - feeBigInt + fieldSize) % fieldSize;

    const levels = await this.inner.getVAnchorLevels(treeId);

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

    console.log('extData', extData);

    const merkleProofs = inputs.map((input, idx) => {
      if (input.amount === '0') {
        return {
          element: BigNumber.from(0), // Temporary use of `BigNumber`, need to change to `BigInt`
          merkleRoot: BigNumber.from(u8aToHex(rootsSet[0])), // Temporary use of `BigNumber`, need to change to `BigInt`
          pathElements: new Array(levels).fill(0),
          pathIndices: new Array(levels).fill(0),
        } satisfies MerkleProof;
      } else {
        const mt = new MerkleTree(
          levels,
          leavesMap[leafIds[idx].typedChainId]?.map((u8a) => u8aToHex(u8a))
        );
        merkleProofs.push(mt.path(input.index));
      }
    });

    const witness = await this.getSnarkJsWitness(
      rootsSet.map((root) => BigInt(u8aToHex(root))),
      BigInt(sourceTypedChainId),
      inputs,
      outputs,
      extAmount,
      feeBigInt,
      extDataHash,
      merkleProofs,
      wasm
    );

    const proof = await this.getSnarkJsProof(zkey, witness);

    const vanchorProofData = this.generatePublicInputs(
      proof,
      rootsSet,
      inputs,
      outputs,
      publicAmount,
      extDataHash
    );

    console.log('vanchorProofData', vanchorProofData);

    return {
      extData,
      extAmount: extData.extAmount,
      vanchorProofData,
    };
  }

  private generatePublicInputs(
    proof: string,
    roots: Uint8Array[],
    inputUtxos: Utxo[],
    outputUtxos: Utxo[],
    publicAmount: bigint,
    extDataHash: bigint
  ): IVAnchorPublicInputs {
    // For publicAmount, it should be 32 bytes, so we use toFixedHex to pad it to 32 bytes.
    const publicAmount32Bytes = toFixedHex(
      ensureHex(publicAmount.toString(16))
    );

    const extDataHash32Bytes = toFixedHex(ensureHex(extDataHash.toString(16)));

    return {
      proof: ensureHex(proof),
      roots,
      extensionRoots: '0x',
      inputNullifiers: inputUtxos.map((utxo) =>
        ensureHex(toFixedHex(`0x${utxo.nullifier}`))
      ),
      outputCommitments: [
        ensureHex(toFixedHex(u8aToHex(outputUtxos[0].commitment))),
        ensureHex(toFixedHex(u8aToHex(outputUtxos[1].commitment))),
      ],
      publicAmount: ensureHex(publicAmount32Bytes),
      extDataHash: ensureHex(extDataHash32Bytes),
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
    const extData: IVariableAnchorExtData = {
      // For recipient, since it is an AccountId (32 bytes) we use toFixedHex to pad it to 32 bytes.
      recipient: toFixedHex(u8aToHex(decodeAddress(recipient))),
      // For relayer, since it is an AccountId (32 bytes) we use toFixedHex to pad it to 32 bytes.
      relayer: toFixedHex(u8aToHex(decodeAddress(relayer))),
      // For extAmount, since it is an Amount (i128) it should be 16 bytes
      extAmount: toFixedHex(extAmount, 16),
      // For fee, since it is a Balance (u128) it should be 16 bytes
      fee: toFixedHex(fee, 16),
      // For refund, since it is a Balance (u128) it should be 16 bytes
      refund: toFixedHex(refund, 16),
      // For token, since it is an AssetId (u32) it should be 4 bytes
      token: toFixedHex(wrapUnwrapToken, 4),
      encryptedOutput1,
      encryptedOutput2,
    };

    const extDataHash = getVAnchorExtDataHash(extData);

    return { extData, extDataHash };
  }

  private async getSnarkJsWitness(
    roots: bigint[],
    typedChainId: bigint,
    inputUtxos: Utxo[],
    outputUtxos: Utxo[],
    extAmount: bigint,
    fee: bigint,
    extDataHash: bigint,
    externalMerkleProofs: MerkleProof[],
    circuitWasm: Buffer
  ): Promise<Uint8Array> {
    const witnessCalculator = await buildVariableWitnessCalculator(
      circuitWasm,
      0
    );
    const witnessInput = generateVariableWitnessInput(
      roots.map((r) => BigNumber.from(r)), // Temporary use of `BigNumber`, need to change to `BigInt`
      typedChainId,
      inputUtxos,
      outputUtxos,
      extAmount,
      fee,
      BigNumber.from(extDataHash), // Temporary use of `BigNumber`, need to change to `BigInt`
      externalMerkleProofs
    );

    return witnessCalculator.calculateWTNSBin(witnessInput, 0);
  }

  private async getSnarkJsProof(
    zkey: Uint8Array,
    witness: Uint8Array
  ): Promise<string> {
    const proofOutput = await snarkjs.groth16.prove(zkey, witness);

    const proof = proofOutput.proof;
    const publicSignals = proofOutput.publicSignals;

    const vKey = await snarkjs.zKey.exportVerificationKey(zkey);

    const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);

    assert.strictEqual(isValid, true, 'Invalid proof');

    return generateWithdrawProofCallData(proof, publicSignals);
  }

  private getExtAmount(inputs: Utxo[], outputs: Utxo[], fee: bigint) {
    const outAmount = outputs.reduce(
      (sum, x) => sum + BigInt(x.amount),
      BigInt(0)
    );
    const inAmount = inputs.reduce(
      (sum, x) => sum + BigInt(x.amount),
      BigInt(0)
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
