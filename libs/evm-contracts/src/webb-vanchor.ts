// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable camelcase */
import type { JsNote } from '@webb-tools/wasm-utils';

import { Log } from '@ethersproject/abstract-provider';
import { LoggerService } from '@webb-tools/app-util';
import { retryPromise } from '@webb-tools/browser-utils/retry-promise';
import {
  ERC20,
  ERC20__factory as ERC20Factory,
  TokenWrapper__factory,
  VAnchor,
  VAnchor__factory,
} from '@webb-tools/contracts';
import { checkNativeAddress, zeroAddress } from '@webb-tools/dapp-types';
import {
  calculateTypedChainId,
  ChainType,
  CircomProvingManager,
  CircomUtxo,
  FIELD_SIZE,
  Keypair,
  ProvingManagerSetupInput,
  randomBN,
  toFixedHex,
  Utxo,
  VAnchorProof,
} from '@webb-tools/sdk-core';
import { ZERO_BYTES32 } from '@webb-tools/utils';
import {
  BigNumber,
  BigNumberish,
  Contract,
  ContractTransaction,
  providers,
  Signer,
} from 'ethers';

import { hexToU8a, u8aToHex } from '@polkadot/util';

import {
  IVariableAnchorExtData,
  IVariableAnchorPublicInputs,
} from '@webb-tools/interfaces';
import { poseidon } from 'circomlibjs';

const logger = LoggerService.get('AnchorContract');

export async function utxoFromVAnchorNote(
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

export const generateCircomCommitment = (note: JsNote): string => {
  const noteSecretParts = note.secrets.split(':');
  const chainId = BigNumber.from('0x' + noteSecretParts[0]).toString();
  const amount = BigNumber.from('0x' + noteSecretParts[1]).toString();
  const secretKey = '0x' + noteSecretParts[2];
  const blinding = '0x' + noteSecretParts[3];

  const keypair = new Keypair(secretKey);

  const hash = poseidon([chainId, amount, keypair.getPubKey(), blinding]);

  return BigNumber.from(hash).toHexString();
};

// The AnchorContract defines useful functions over an anchor that do not depend on zero knowledge.
export class VAnchorContract {
  public _contract: VAnchor;
  public readonly signer: Signer;

  constructor(
    private web3Provider: providers.Web3Provider,
    address: string,
    useProvider = false
  ) {
    this.signer = this.web3Provider.getSigner();
    logger.info(`Init with address ${address} `);
    this._contract = VAnchor__factory.connect(
      address,
      useProvider ? this.web3Provider : this.signer
    );
  }

  get inner() {
    return this._contract;
  }

  async getLastRoot() {
    return this._contract.getLastRoot();
  }

  async getNextIndex() {
    return this._contract.getNextIndex();
  }

  async getEvmId() {
    return this.web3Provider.getSigner().getChainId();
  }

  async getChainIdType() {
    return calculateTypedChainId(ChainType.EVM, await this.getEvmId());
  }

  async generateDefaultUtxo(): Promise<Utxo> {
    return await CircomUtxo.generateUtxo({
      curve: 'Bn254',
      backend: 'Circom',
      amount: '0',
      chainId: (await this.getChainIdType()).toString(),
      originChainId: (await this.getChainIdType()).toString(),
    });
  }

  async getWebbToken(): Promise<ERC20> {
    const tokenAddress = await this._contract.token();
    const tokenInstance = ERC20Factory.connect(tokenAddress, this.signer);

    return tokenInstance;
  }

  async isWebbTokenApprovalRequired(depositAmount: BigNumberish) {
    const userAddress = await this.signer.getAddress();
    const tokenInstance = await this.getWebbToken();
    const tokenAllowance = await tokenInstance.allowance(
      userAddress,
      this._contract.address
    );

    if (tokenAllowance < depositAmount) {
      return true;
    }

    return false;
  }

  async isWrappableTokenApprovalRequired(
    tokenAddress: string,
    depositAmount: BigNumberish
  ) {
    const userAddress = await this.signer.getAddress();
    const webbToken = await this.getWebbToken();
    const tokenAllowance = await webbToken.allowance(
      userAddress,
      webbToken.address
    );

    if (tokenAllowance < depositAmount) {
      return true;
    }

    return false;
  }

  async hasEnoughBalance(depositAmount: BigNumberish, tokenAddress?: string) {
    const userAddress = await this.signer.getAddress();
    let tokenBalance: BigNumber;

    // If a token address was supplied, the user is querying for enough balance of a wrappableToken
    if (tokenAddress) {
      // query for native balance
      if (tokenAddress === zeroAddress) {
        tokenBalance = await this.signer.getBalance();
      } else {
        const tokenInstance = ERC20Factory.connect(tokenAddress, this.signer);

        tokenBalance = await tokenInstance.balanceOf(userAddress);
      }
    } else {
      // Querying for balance of the webbToken
      const tokenInstance = await this.getWebbToken();

      tokenBalance = await tokenInstance.balanceOf(userAddress);
    }

    if (tokenBalance.lt(BigNumber.from(depositAmount))) {
      return false;
    }

    return true;
  }

  async register(owner: string, keyData: string) {
    const tx = await this.inner.register({
      owner,
      keyData,
    });
    const receipt = await tx.wait();
  }

  async approve(depositAmount: BigNumberish, tokenInstance: Contract) {
    // check the approved spending before attempting deposit
    if (tokenInstance == null) {
      return;
    }

    if (tokenInstance != null) {
      const tx = await tokenInstance.approve(
        this._contract.address,
        depositAmount
      );

      await tx.wait();
    }
  }

  // Make a deposit. It will create a zkp and make a tx which will result in the passed utxo
  // being registered on-chain.
  async deposit(
    utxo: CircomUtxo,
    wrapUnwrapToken: string,
    leavesMap: Record<string, Uint8Array[]>,
    provingKey: Uint8Array,
    circuitWasm: Buffer,
    worker: Worker
  ): Promise<ContractTransaction> {
    const sender = await this.signer.getAddress();
    const sourceChainId = calculateTypedChainId(
      ChainType.EVM,
      await this.signer.getChainId()
    );

    // Build up the inputs for proving manager
    const randomKeypair = new Keypair();
    const dummyOutputUtxo = await CircomUtxo.generateUtxo({
      curve: 'Bn254',
      backend: 'Circom',
      chainId: sourceChainId.toString(),
      originChainId: sourceChainId.toString(),
      amount: '0',
      keypair: randomKeypair,
    });
    const inputs: Utxo[] = [];
    const outputs: [Utxo, Utxo] = [utxo, dummyOutputUtxo];

    while (inputs.length !== 2 && inputs.length < 16) {
      inputs.push(
        await CircomUtxo.generateUtxo({
          curve: 'Bn254',
          backend: 'Circom',
          chainId: sourceChainId.toString(),
          originChainId: sourceChainId.toString(),
          amount: '0',
          blinding: hexToU8a(randomBN(31).toHexString()),
          keypair: randomKeypair,
        })
      );
    }

    const extAmount = BigNumber.from(0)
      .add(
        outputs.reduce(
          (sum: BigNumber, x: Utxo) => sum.add(x.amount),
          BigNumber.from(0)
        )
      )
      .sub(
        inputs.reduce(
          (sum: BigNumber, x: Utxo) => sum.add(x.amount),
          BigNumber.from(0)
        )
      );
    console.log('About to setup tx');
    const { extData, publicInputs } = await this.setupTransaction(
      inputs,
      outputs,
      extAmount,
      0,
      0,
      sender,
      sender,
      wrapUnwrapToken,
      leavesMap,
      provingKey,
      circuitWasm,
      worker
    );
    console.log('After setting up TX');
    // A deposit is meant for the same recipient as signer
    let options = {};
    if (extAmount.gt(0) && checkNativeAddress(wrapUnwrapToken)) {
      const tokenWrapper = TokenWrapper__factory.connect(
        await this.inner.token(),
        this.signer
      );
      const valueToSend = await tokenWrapper.getAmountToWrap(extAmount);

      options = {
        value: valueToSend.toHexString(),
      };
    } else {
      options = {};
    }

    // A deposit is meant for the same recipient as signer
    const tx = await this.inner.transact(
      publicInputs.proof,
      ZERO_BYTES32,
      {
        ...extData,
      },
      {
        roots: publicInputs.roots,
        extensionRoots: '0x',
        inputNullifiers: publicInputs.inputNullifiers,
        outputCommitments: [
          publicInputs.outputCommitments[0],
          publicInputs.outputCommitments[1],
        ],
        publicAmount: publicInputs.publicAmount,
        extDataHash: publicInputs.extDataHash,
      },
      {
        encryptedOutput1: extData.encryptedOutput1,
        encryptedOutput2: extData.encryptedOutput2,
      },
      {
        gasLimit: 9_000_000,
        ...options,
      }
    );

    return tx;
  }

  // Verify the leaf occurred at the reported block
  // This is important to check the behavior of relayers before modifying local storage
  async leafCreatedAtBlock(
    leaf: string,
    blockNumber: number
  ): Promise<boolean> {
    const filter = this._contract.filters.NewCommitment(null, null, null);
    const logs = await this.web3Provider.getLogs({
      fromBlock: blockNumber,
      toBlock: blockNumber,
      ...filter,
    });
    const events = logs.map((log) => this._contract.interface.parseLog(log));

    for (let i = 0; i < events.length; i++) {
      if (events[i].args.commitment === leaf) {
        return true;
      }
    }

    return false;
  }

  async getDepositLeaves(
    startingBlock: number,
    finalBlock: number,
    abortSignal: AbortSignal
  ): Promise<{ lastQueriedBlock: number; newLeaves: string[] }> {
    const filter = this._contract.filters.NewCommitment(null, null, null);

    console.log('Getting leaves with filter', filter);
    finalBlock = finalBlock || (await this.web3Provider.getBlockNumber());
    console.log(`finalBlock detected as: ${finalBlock}`);

    let logs: Array<Log> = []; // Read the stored logs into this variable
    const step = 1000; // Metamask infura caps requests at 1000 blocks
    console.log(`Fetching leaves with steps of ${step} logs/request`);

    try {
      for (let i = startingBlock; i < finalBlock; i += step) {
        const nextLogs = await retryPromise(
          () => {
            return this.web3Provider.getLogs({
              fromBlock: i,
              toBlock: finalBlock - i > step ? i + step : finalBlock,
              ...filter,
            });
          },
          20,
          10,
          abortSignal
        );

        logs = [...logs, ...nextLogs];

        console.log(`Getting logs for block range: ${i} through ${i + step}`);
      }
    } catch (e) {
      logger.error(e);
      throw e;
    }

    const events = logs.map((log) => this._contract.interface.parseLog(log));

    const newCommitments = events
      .sort((a, b) => a.args.index - b.args.index) // Sort events in chronological order
      .map((e) => BigNumber.from(e.args.commitment).toHexString());
    return {
      lastQueriedBlock: finalBlock,
      newLeaves: newCommitments,
    };
  }

  // This function will query the chain for notes that are spendable by a keypair in a block range
  async getSpendableUtxosFromChain(
    owner: Keypair,
    startingBlock: number,
    finalBlock: number,
    abortSignal: AbortSignal
  ): Promise<Utxo[]> {
    const filter = this._contract.filters.NewCommitment(null, null, null);
    let logs: Array<Log> = []; // Read the stored logs into this variable

    finalBlock = finalBlock || (await this.web3Provider.getBlockNumber());
    console.log(`Getting notes from chain`);
    // number of blocks to query at a time
    const step = 1024;
    console.log(`Fetching notes with steps of ${step} logs/request`);

    try {
      for (let i = startingBlock; i < finalBlock; i += step) {
        const nextLogs = await retryPromise(
          () => {
            return this.web3Provider.getLogs({
              fromBlock: i,
              toBlock: finalBlock - i > step ? i + step : finalBlock,
              ...filter,
            });
          },
          20,
          10,
          abortSignal
        );

        logs = [...logs, ...nextLogs];

        console.log(`Getting logs for block range: ${i} through ${i + step}`);
      }
    } catch (e) {
      logger.error(e);
      throw e;
    }

    const events = logs.map((log) => this._contract.interface.parseLog(log));
    const encryptedCommitments: string[] = events
      .sort((a, b) => a.args.index - b.args.index) // Sort events in chronological order
      .map((e) => e.args.encryptedOutput);

    // Attempt to decrypt with the owner's keypair
    const utxos = await Promise.all(
      encryptedCommitments.map(async (enc, index) => {
        try {
          const decryptedUtxo = await CircomUtxo.decrypt(owner, enc);
          // In order to properly calculate the nullifier, an index is required.
          // The decrypt function generates a utxo without an index, and the index is a readonly property.
          // So, regenerate the utxo with the proper index.
          const regeneratedUtxo = await CircomUtxo.generateUtxo({
            amount: decryptedUtxo.amount,
            backend: 'Circom',
            blinding: hexToU8a(decryptedUtxo.blinding),
            chainId: decryptedUtxo.chainId,
            curve: 'Bn254',
            keypair: owner,
            index: index.toString(),
          });
          const alreadySpent = await this._contract.isSpent(
            toFixedHex(`0x${regeneratedUtxo.nullifier}`, 32)
          );
          if (!alreadySpent) {
            return regeneratedUtxo;
          } else {
            return undefined;
          }
        } catch (e) {
          return undefined;
        }
      })
    );

    // Unsure why the following filter statement does not change type from (Utxo | undefined)[] to Utxo[]
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const decryptedUtxos: Utxo[] = utxos.filter((value) => value !== undefined);

    return decryptedUtxos;
  }

  async getRootsForProof(): Promise<BigNumber[]> {
    const neighborEdges = await this._contract.getLatestNeighborEdges();
    const neighborRoots = neighborEdges.map((rootData) => {
      return rootData.root;
    });
    const thisRoot = await this._contract.getLastRoot();
    return [thisRoot, ...neighborRoots];
  }

  public async setupTransaction(
    inputs: Utxo[],
    outputs: [Utxo, Utxo],
    extAmount: BigNumberish,
    fee: BigNumberish,
    refund: BigNumberish,
    recipient: string,
    relayer: string,
    token: string,
    leavesMap: Record<string, Uint8Array[]>,
    provingKey: Uint8Array,
    wasmBuffer: Buffer,
    worker: Worker
  ): Promise<{
    extData: IVariableAnchorExtData;
    publicInputs: IVariableAnchorPublicInputs;
    outputUtxos: Utxo[];
  }> {
    const chainId = calculateTypedChainId(
      ChainType.EVM,
      await this.signer.getChainId()
    );
    const roots = await this.getRootsForProof();

    const encryptedCommitments: [Uint8Array, Uint8Array] = [
      hexToU8a(outputs[0].encrypt()),
      hexToU8a(outputs[1].encrypt()),
    ];

    const proofInput: ProvingManagerSetupInput<'vanchor'> = {
      inputUtxos: inputs,
      leafIds: inputs.map((input) => {
        return {
          typedChainId: Number(input.originChainId),
          index: input.index,
        };
      }),
      leavesMap,
      roots: roots.map((root) => hexToU8a(root.toHexString())),
      chainId: chainId.toString(),
      output: outputs,
      encryptedCommitments,
      publicAmount: BigNumber.from(extAmount)
        .sub(fee)
        .add(FIELD_SIZE)
        .mod(FIELD_SIZE)
        .toString(),
      provingKey,
      relayer: hexToU8a(relayer),
      recipient: hexToU8a(recipient),
      extAmount: toFixedHex(BigNumber.from(extAmount)),
      fee: BigNumber.from(fee).toString(),
      refund: BigNumber.from(refund).toString(),
      token: hexToU8a(toFixedHex(token, 20)),
    };

    console.log('proofInput: ', proofInput);

    const levels = await this.inner.getLevels();
    const provingManager = new CircomProvingManager(wasmBuffer, levels, worker);
    const proof = (await provingManager.prove(
      'vanchor',
      proofInput
    )) as VAnchorProof;

    const publicInputs: IVariableAnchorPublicInputs = this.generatePublicInputs(
      proof.proof,
      roots,
      inputs,
      outputs,
      proofInput.publicAmount,
      BigNumber.from(u8aToHex(proof.extDataHash))
    );

    console.log('publicInputs: ', publicInputs);
    const extData: IVariableAnchorExtData = {
      recipient: toFixedHex(proofInput.recipient, 20),
      extAmount: toFixedHex(proofInput.extAmount),
      relayer: toFixedHex(proofInput.relayer, 20),
      fee: toFixedHex(proofInput.fee, 20),
      refund: toFixedHex(proofInput.refund),
      token: toFixedHex(proofInput.token, 20),
      encryptedOutput1: u8aToHex(proofInput.encryptedCommitments[0]),
      encryptedOutput2: u8aToHex(proofInput.encryptedCommitments[1]),
    };

    console.log('extData: ', extData);

    return {
      extData,
      publicInputs,
      outputUtxos: proof.outputUtxos,
    };
  }

  public generatePublicInputs(
    proof: any,
    roots: BigNumber[],
    inputs: Utxo[],
    outputs: Utxo[],
    publicAmount: BigNumberish,
    extDataHash: BigNumber
  ): IVariableAnchorPublicInputs {
    // public inputs to the contract
    const args: IVariableAnchorPublicInputs = {
      proof: `0x${proof}`,
      roots: `0x${roots.map((x) => toFixedHex(x).slice(2)).join('')}`,
      extensionRoots: '0x00',
      inputNullifiers: inputs.map((x) =>
        BigNumber.from(toFixedHex(`0x${x.nullifier}`))
      ),
      outputCommitments: [
        BigNumber.from(toFixedHex(u8aToHex(outputs[0].commitment))),
        BigNumber.from(toFixedHex(u8aToHex(outputs[1].commitment))),
      ],
      publicAmount: toFixedHex(publicAmount),
      extDataHash,
    };

    return args;
  }
}
