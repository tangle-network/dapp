import { TransactionOptions, TransactionState } from '@webb-tools/anchors';
import {
  ERC20__factory,
  TokenWrapper__factory,
  VAnchorTree__factory,
} from '@webb-tools/contracts';
import { ZERO_BIG_INT, ensureHex } from '@webb-tools/dapp-config';
import {
  WebbError,
  WebbErrorCodes,
  checkNativeAddress,
} from '@webb-tools/dapp-types';
import {
  CircomUtxo,
  Keypair,
  MerkleTree,
  Utxo,
  buildVariableWitnessCalculator,
  randomBN,
  toFixedHex,
} from '@webb-tools/sdk-core';
import {
  FIELD_SIZE,
  Proof,
  VAnchorProofInputs,
  ZERO_BYTES32,
  ZkComponents,
  getChainIdType,
  hexToU8a,
  u8aToHex,
} from '@webb-tools/utils';
import assert from 'assert';
import merge from 'lodash/merge';
import { groth16, zKey } from 'snarkjs';
import {
  Account,
  Address,
  GetContractReturnType,
  Hash,
  Client as ViemClient,
  TransactionRequestBase,
  WalletClient,
  encodeAbiParameters,
  getContract,
  keccak256,
  parseAbiParameters,
} from 'viem';

type FullProof = {
  proof: Proof;
  publicSignals: string[11];
};

/**
 * This class is mostly copy from the original VAnchor.ts
 * from protocol-solidity repo and refactor to use viem.sh
 */
class VAnchor {
  public readonly tree: MerkleTree;

  // The depositHistory stores leafIndex => information to create proposals (new root)
  public readonly depositHistory: Record<number, string>;

  constructor(
    public readonly client: ViemClient,
    public readonly contract: GetContractReturnType<
      typeof VAnchorTree__factory.abi,
      ViemClient
    >,
    public readonly treeHeight: number,
    public readonly maxEdges: number,
    public readonly fungibleToken: Address,
    public readonly smallCircuitZkComponents: ZkComponents,
    public readonly largeCircuitZkComponents: ZkComponents,
  ) {
    this.tree = new MerkleTree(treeHeight);
    this.depositHistory = {};
  }

  public static async connect(
    address: Address,
    smallCircuitZkComponents: ZkComponents,
    largeCircuitZkComponents: ZkComponents,
    publicClient: ViemClient,
  ) {
    const vAnchorContract = getContract({
      address: address,
      abi: VAnchorTree__factory.abi,
      client: publicClient,
    });

    const [maxEdges, treeHeight, token] = await Promise.all([
      vAnchorContract.read.maxEdges(),
      vAnchorContract.read.levels(),
      vAnchorContract.read.token(),
    ]);

    const createdAnchor = new VAnchor(
      publicClient,
      vAnchorContract,
      treeHeight,
      maxEdges,
      token,
      smallCircuitZkComponents,
      largeCircuitZkComponents,
    );

    return createdAnchor;
  }

  public async padUtxos(utxos: Utxo[], maxLen: number): Promise<Utxo[]> {
    const evmId = await this.contract.read.getChainId();
    const chainId = getChainIdType(+evmId.toString());
    const randomKeypair = new Keypair();

    while (utxos.length !== 2 && utxos.length < maxLen) {
      utxos.push(
        await CircomUtxo.generateUtxo({
          curve: 'Bn254',
          backend: 'Circom',
          chainId: chainId.toString(),
          originChainId: chainId.toString(),
          amount: '0',
          blinding: hexToU8a(randomBN(31).toHexString()),
          keypair: randomKeypair,
        }),
      );
    }

    if (utxos.length !== 2 && utxos.length !== maxLen) {
      throw new Error('Invalid utxo length');
    }

    return utxos;
  }

  public async setupTransaction(
    inputs: Utxo[],
    outputs: [Utxo, Utxo],
    fee: bigint,
    refund: bigint,
    recipient: Address,
    relayer: Address,
    wrapUnwrapTokenArg: string,
    leavesMap: Record<string, Uint8Array[]>,
  ) {
    let wrapUnwrapToken: Address = this.fungibleToken;

    if (wrapUnwrapTokenArg.length !== 0) {
      wrapUnwrapToken = ensureHex(wrapUnwrapTokenArg);
    }

    if (!wrapUnwrapToken) {
      throw new Error('Token address not set');
    }

    if (outputs.length !== 2) {
      throw new Error('Only two outputs are supported');
    }

    const evmId = await this.contract.read.getChainId();
    const chainId = getChainIdType(+evmId.toString());
    const roots = await this.populateRootsForProof();
    const extAmount = this.getExtAmount(inputs, outputs, fee);

    const { extData, extDataHash } = this.generateExtData(
      recipient,
      extAmount,
      relayer,
      fee,
      refund,
      wrapUnwrapToken,
      ensureHex(outputs[0].encrypt()),
      ensureHex(outputs[1].encrypt()),
    );

    const vanchorInput: VAnchorProofInputs = await this.generateProofInputs(
      inputs,
      outputs,
      chainId,
      extAmount,
      fee,
      extDataHash,
      leavesMap,
    );

    const fullProof = await this.generateProof(vanchorInput);

    const zkey =
      inputs.length === 2
        ? this.smallCircuitZkComponents.zkey
        : this.largeCircuitZkComponents.zkey;

    const vKey = await zKey.exportVerificationKey(zkey);

    const isValid: boolean = await groth16.verify(
      vKey,
      fullProof.publicSignals,
      fullProof.proof,
    );

    assert.strictEqual(isValid, true);

    const publicAmount = this.getPublicAmount(extAmount, fee);

    const proof = await this.generateProofCalldata(fullProof);

    const publicInputs = this.generatePublicInputs(
      proof,
      roots,
      inputs,
      outputs,
      publicAmount,
      extDataHash,
    );

    return {
      extAmount,
      extData,
      publicInputs,
    };
  }

  public async populateRootsForProof(): Promise<bigint[]> {
    const [neighborEdges, thisRoot] = await Promise.all([
      this.contract.read.getLatestNeighborEdges(),
      this.contract.read.getLastRoot(),
    ]);

    const neighborRootInfos = neighborEdges.map((rootData) => {
      return rootData.root;
    });

    return [thisRoot, ...neighborRootInfos];
  }

  public async generateProofInputs(
    inputs: Utxo[],
    outputs: Utxo[],
    chainId: number,
    extAmount: bigint,
    fee: bigint,
    extDataHash: bigint,
    leavesMap: Record<string, Uint8Array[]>,
  ): Promise<VAnchorProofInputs> {
    const vAnchorRoots = await this.populateRootsForProof();
    let vanchorMerkleProof: Array<ReturnType<typeof this.getMerkleProof>>;

    if (Object.keys(leavesMap).length === 0) {
      vanchorMerkleProof = inputs.map((x) => this.getMerkleProof(x));
    } else {
      vanchorMerkleProof = inputs.map((utxo) =>
        this.getMerkleProof(
          utxo,
          utxo.originChainId ? leavesMap[utxo.originChainId] : undefined,
        ),
      );
    }

    const vanchorMerkleProofs = vanchorMerkleProof.map((proof) => ({
      pathIndex: MerkleTree.calculateIndexFromPathIndices(proof.pathIndices),
      pathElements: proof.pathElements,
    }));

    // TODO: fix any type
    const vAnchorInput: any = {
      roots: vAnchorRoots.map((x) => x.toString()),
      chainID: chainId.toString(),
      inputNullifier: inputs.map((x) => '0x' + x.nullifier),
      outputCommitment: outputs.map((x) =>
        BigInt(u8aToHex(x.commitment)).toString(),
      ),
      publicAmount: this.getPublicAmount(extAmount, fee).toString(),
      extDataHash: extDataHash.toString(),
      // data for 2 transaction inputs
      inAmount: inputs.map((x) => x.amount.toString()),
      inPrivateKey: inputs.map((x) => ensureHex(x.secret_key)),
      inBlinding: inputs.map((x) => BigInt(ensureHex(x.blinding)).toString()),
      inPathIndices: vanchorMerkleProofs.map((x) => x.pathIndex),
      inPathElements: vanchorMerkleProofs.map((x) => x.pathElements),
      // data for 2 transaction outputs
      outChainID: outputs.map((x) => x.chainId),
      outAmount: outputs.map((x) => x.amount.toString()),
      outPubkey: outputs.map((x) =>
        BigInt(x.getKeypair().getPubKey()).toString(),
      ),
      outBlinding: outputs.map((x) => BigInt(ensureHex(x.blinding)).toString()),
    };

    return vAnchorInput;
  }

  public async generateProof(
    vanchorInputs: VAnchorProofInputs,
  ): Promise<FullProof> {
    const circuitWasm =
      vanchorInputs.inAmount.length === 2
        ? this.smallCircuitZkComponents.wasm
        : this.largeCircuitZkComponents.wasm;
    const zkey =
      vanchorInputs.inAmount.length === 2
        ? this.smallCircuitZkComponents.zkey
        : this.largeCircuitZkComponents.zkey;

    const witnessCalculator = await buildVariableWitnessCalculator(
      circuitWasm,
      0,
    );
    const witness = await witnessCalculator.calculateWTNSBin(vanchorInputs, 0);

    const proof = await groth16.prove(zkey, witness);

    return proof;
  }

  public async generateProofCalldata(fullProof: FullProof) {
    const calldata = await groth16.exportSolidityCallData(
      fullProof.proof,
      fullProof.publicSignals,
    );
    const proof = JSON.parse('[' + calldata + ']');
    const pi_a = proof[0];
    const pi_b = proof[1];
    const pi_c = proof[2];

    const proofEncoded = [
      pi_a[0],
      pi_a[1],
      pi_b[0][0],
      pi_b[0][1],
      pi_b[1][0],
      pi_b[1][1],
      pi_c[0],
      pi_c[1],
    ]
      .map((elt) => elt.substr(2))
      .join('');

    return proofEncoded;
  }

  public async transact(
    inputs: Utxo[],
    outputs: Utxo[],
    fee: bigint,
    refund: bigint,
    recipient: Address,
    relayer: Address,
    wrapUnwrapToken: string,
    leavesMap: Record<string, Uint8Array[]>, // subtree
    overridesTransaction: TransactionOptions & {
      walletClient: WalletClient;
    } & Partial<TransactionRequestBase>,
  ) {
    // Ignore the type of the transaction to use the default one
    const [{ walletClient, type: _, ...override }, txOptions] =
      this.splitTransactionOptions(overridesTransaction);

    if (!walletClient.account) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }

    // Default UTXO chain ID will match with the configured signer's chain ID
    const inputs_ = await this.padUtxos(inputs, 16);
    const outputs_ = await this.padUtxos(outputs, 2);

    txOptions.onTransactionState?.(
      TransactionState.GENERATE_ZK_PROOF,
      undefined,
    );
    const { extAmount, extData, publicInputs } = await this.setupTransaction(
      inputs_,
      [outputs_[0], outputs_[1]],
      fee,
      refund,
      recipient,
      relayer,
      wrapUnwrapToken,
      leavesMap,
    );

    const txValueOption = await this.getWrapUnwrapOptions(
      extAmount,
      refund,
      wrapUnwrapToken,
    );

    txOptions.onTransactionState?.(
      TransactionState.INITIALIZE_TRANSACTION,
      undefined,
    );

    const { request } = await this.contract.simulate.transact(
      [
        publicInputs.proof,
        ZERO_BYTES32,
        {
          recipient: extData.recipient,
          extAmount: extData.extAmount,
          relayer: extData.relayer,
          fee: extData.fee,
          refund: extData.refund,
          token: extData.token,
        },
        {
          roots: publicInputs.roots,
          // extensionRoots: isForest ? [] :  publicInputs.extensionRoots ,
          extensionRoots: publicInputs.extensionRoots,
          inputNullifiers: publicInputs.inputNullifiers,
          outputCommitments: [
            publicInputs.outputCommitments[0],
            publicInputs.outputCommitments[1],
          ],
          publicAmount: BigInt(publicInputs.publicAmount),
          extDataHash: publicInputs.extDataHash,
        },
        {
          encryptedOutput1: extData.encryptedOutput1,
          encryptedOutput2: extData.encryptedOutput2,
        },
      ],
      merge({ account: walletClient.account.address }, txValueOption, override),
    );

    console.log('request', request);

    const txHash = await walletClient.writeContract(request);

    txOptions.onTransactionState?.(
      TransactionState.WAITING_FOR_FINALIZATION,
      txHash,
    );

    this.updateTreeOrForestState(outputs);

    return txHash;
  }

  public async getWrapUnwrapOptions(
    extAmount: bigint,
    refund: bigint,
    wrapUnwrapToken: string,
  ) {
    if (extAmount > ZERO_BIG_INT && checkNativeAddress(wrapUnwrapToken)) {
      const tokenWrapperContract = getContract({
        address: this.fungibleToken,
        abi: TokenWrapper__factory.abi,
        client: this.client,
      });

      const valueToSend = await tokenWrapperContract.read.getAmountToWrap([
        extAmount,
      ]);

      return {
        value: valueToSend,
      };
    } else if (extAmount < ZERO_BIG_INT) {
      return {
        value: refund,
      };
    }

    if (refund > ZERO_BIG_INT && extAmount >= ZERO_BIG_INT) {
      throw new Error('Refund should be zero');
    }

    return {
      value: ZERO_BIG_INT,
    };
  }

  public async isWebbTokenApprovalRequired(
    depositAmount: bigint,
    account: Account,
  ) {
    const tokenInstance = this.getWebbToken();
    const tokenAllowance = await tokenInstance.read.allowance([
      account.address,
      this.contract.address,
    ]);

    if (tokenAllowance < depositAmount) {
      return true;
    }

    return false;
  }

  public async isWrappableTokenApprovalRequired(
    tokenAddress: Address,
    depositAmount: bigint,
    account: Account,
  ) {
    const userAddress = account.address;

    const tokenInstance = getContract({
      address: tokenAddress,
      abi: ERC20__factory.abi,
      client: this.client,
    });

    // When wrapping, we need to check allowance of the fungible token
    // as the fungible token is the contract that transfers the token
    // from the user to the contract
    const tokenAllowance = await tokenInstance.read.allowance([
      userAddress,
      this.fungibleToken,
    ]);

    if (tokenAllowance < depositAmount) {
      return true;
    }

    return false;
  }

  public getWebbToken(): GetContractReturnType<
    typeof ERC20__factory.abi,
    ViemClient
  > {
    return getContract({
      address: this.fungibleToken,
      abi: ERC20__factory.abi,
      client: this.client,
    });
  }

  public splitTransactionOptions<T extends object>(
    options?: T & TransactionOptions,
  ): [T, TransactionOptions] {
    const {
      keypair,
      treeChainId,
      externalLeaves,
      onTransactionState,
      ...rest
    } = options ?? {};

    return [
      rest,
      { keypair, treeChainId, externalLeaves, onTransactionState },
    ] as [T, TransactionOptions];
  }

  public getExtAmount(inputs: Utxo[], outputs: Utxo[], fee: bigint) {
    const sumInAmount = inputs.reduce(
      (sum, current) => sum + BigInt(current.amount),
      ZERO_BIG_INT,
    );

    const sumOutAmount = outputs.reduce(
      (sum, current) => sum + BigInt(current.amount),
      ZERO_BIG_INT,
    );

    return fee + sumOutAmount - sumInAmount;
  }

  public getPublicAmount(extAmount: bigint, fee: bigint): bigint {
    const fieldSize = FIELD_SIZE.toBigInt();
    return (extAmount - fee + fieldSize) % fieldSize;
  }

  public generateExtData(
    recipient: string,
    extAmount: bigint,
    relayer: string,
    fee: bigint,
    refund: bigint,
    wrapUnwrapToken: Address,
    encryptedOutput1: Hash,
    encryptedOutput2: Hash,
  ) {
    const extData = {
      recipient: toFixedHex(recipient, 20) as Hash,
      extAmount: extAmount,
      relayer: toFixedHex(relayer, 20) as Hash,
      fee: fee,
      refund: refund,
      token: toFixedHex(wrapUnwrapToken, 20) as Hash,
      encryptedOutput1,
      encryptedOutput2,
    };

    const extDataHash = this.getVAnchorExtDataHash(extData);
    return { extData, extDataHash };
  }

  public getVAnchorExtDataHash(
    extData: ReturnType<VAnchor['generateExtData']>['extData'],
  ): bigint {
    const encodedData = encodeAbiParameters(
      parseAbiParameters(
        '(address recipient,int256 extAmount,address relayer,uint256 fee,uint256 refund,address token,bytes encryptedOutput1,bytes encryptedOutput2)',
      ),
      [
        {
          recipient: extData.recipient,
          extAmount: extData.extAmount,
          relayer: extData.relayer,
          fee: extData.fee,
          refund: extData.refund,
          token: extData.token,
          encryptedOutput1: extData.encryptedOutput1,
          encryptedOutput2: extData.encryptedOutput2,
        },
      ],
    );

    const hash = keccak256(encodedData);

    return BigInt(hash) % FIELD_SIZE.toBigInt();
  }

  public getMerkleProof(input: Utxo, leavesMap?: Uint8Array[]) {
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
        const path = this.tree.path(input.index);
        inputMerklePathIndices = path.pathIndices;
        inputMerklePathElements = path.pathElements.map((p) => p.toBigInt());
      } else {
        const mt = new MerkleTree(this.treeHeight, leavesMap);
        const path = mt.path(input.index);
        inputMerklePathIndices = path.pathIndices;
        inputMerklePathElements = path.pathElements.map((p) => p.toBigInt());
      }
    } else {
      inputMerklePathIndices = new Array(this.tree.levels).fill(0);
      inputMerklePathElements = new Array(this.tree.levels).fill(0);
    }

    return {
      element: BigInt(u8aToHex(input.commitment)),
      pathElements: inputMerklePathElements,
      pathIndices: inputMerklePathIndices,
      merkleRoot: this.tree.root().toBigInt(),
    };
  }

  public generatePublicInputs(
    proof: string,
    roots: Array<bigint>,
    inputs: Array<Utxo>,
    outputs: [Utxo, Utxo],
    publicAmount: bigint,
    extDataHash: bigint,
  ) {
    // public inputs to the contract
    const args = {
      proof: `0x${proof}` as Hash,
      roots: `0x${roots.map((x) => toFixedHex(x).slice(2)).join('')}` as Hash,
      extensionRoots: '0x' as Hash,
      inputNullifiers: inputs.map((x) =>
        BigInt(toFixedHex(ensureHex(x.nullifier))),
      ),
      outputCommitments: [
        BigInt(toFixedHex(u8aToHex(outputs[0].commitment))),
        BigInt(toFixedHex(u8aToHex(outputs[1].commitment))),
      ] as const,
      publicAmount: toFixedHex(publicAmount) as Hash,
      extDataHash: BigInt(extDataHash),
    };

    return args;
  }

  public updateTreeOrForestState(outputs: Utxo[]): void {
    outputs.forEach((x) => {
      this.tree.insert(u8aToHex(x.commitment));
      const numOfElements = this.tree.number_of_elements();
      this.depositHistory[numOfElements - 1] = toFixedHex(
        this.tree.root().toString(),
      );
    });
  }
}

export default VAnchor;
