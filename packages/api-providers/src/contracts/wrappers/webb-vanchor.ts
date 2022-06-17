// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable camelcase */

import { Log } from '@ethersproject/abstract-provider';
import { retryPromise } from '@webb-dapp/api-providers/utils/retry-promise';
import { LoggerService } from '@webb-tools/app-util';
import { ERC20, ERC20__factory as ERC20Factory, VAnchor, VAnchor__factory } from '@webb-tools/contracts';
import { IAnchorDepositInfo } from '@webb-tools/interfaces';
import {
  CircomProvingManager,
  CircomUtxo,
  FIELD_SIZE,
  Keypair,
  MerkleTree,
  Note,
  NoteGenInput,
  ProvingManagerSetupInput,
  randomBN,
  toFixedHex,
  Utxo,
} from '@webb-tools/sdk-core';
import { BigNumber, BigNumberish, Contract, ContractTransaction, ethers, providers, Signer } from 'ethers';

import { hexToU8a, u8aToHex } from '@polkadot/util';

import { ChainType, computeChainIdType } from '../..';
import { zeroAddress } from '..';

const logger = LoggerService.get('AnchorContract');

export interface IVariableAnchorPublicInputs {
  proof: string;
  roots: string;
  inputNullifiers: string[];
  outputCommitments: [string, string];
  publicAmount: string;
  extDataHash: string;
}

// The AnchorContract defines useful functions over an anchor that do not depend on zero knowledge.
export class VAnchorContract {
  public _contract: VAnchor;
  private readonly signer: Signer;

  constructor(private web3Provider: providers.Web3Provider, address: string, useProvider = false) {
    this.signer = this.web3Provider.getSigner();
    logger.info(`Init with address ${address} `);
    this._contract = VAnchor__factory.connect(address, useProvider ? this.web3Provider : this.signer);
  }

  get inner() {
    return this._contract;
  }

  async getLastRoot() {
    return this._contract.getLastRoot();
  }

  async getNextIndex() {
    return this._contract.nextIndex();
  }

  async getEvmId() {
    return this.web3Provider.getSigner().getChainId();
  }

  async getChainIdType() {
    return computeChainIdType(ChainType.EVM, await this.getEvmId());
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
    const tokenAllowance = await tokenInstance.allowance(userAddress, this._contract.address);

    if (tokenAllowance < depositAmount) {
      return true;
    }

    return false;
  }

  async isWrappableTokenApprovalRequired(tokenAddress: string, depositAmount: BigNumberish) {
    // Native token never requires approval
    if (tokenAddress === zeroAddress) {
      return false;
    }

    const userAddress = await this.signer.getAddress();
    const webbToken = await this.getWebbToken();
    const tokenAllowance = await webbToken.allowance(userAddress, webbToken.address);

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

        tokenBalance = ethers.utils.parseEther((await tokenInstance.balanceOf(userAddress)).toString());
      }
    } else {
      // Querying for balance of the webbToken
      const tokenInstance = await this.getWebbToken();

      tokenBalance = ethers.utils.parseEther((await tokenInstance.balanceOf(userAddress)).toString());
    }

    console.log(tokenBalance);

    if (tokenBalance.lt(BigNumber.from(depositAmount))) {
      return false;
    }

    return true;
  }

  async approve(depositAmount: BigNumberish, tokenInstance: Contract) {
    // check the approved spending before attempting deposit
    if (tokenInstance == null) {
      return;
    }

    if (tokenInstance != null) {
      const tx = await tokenInstance.approve(this._contract.address, depositAmount);

      await tx.wait();
    }
  }

  // Make a deposit. It will create a zkp and make a tx which will result in the passed utxo
  // being registered on-chain.
  async deposit(
    utxo: CircomUtxo,
    leavesMap: Record<string, Uint8Array[]>,
    provingKey: Uint8Array,
    circuitWasm: Buffer
  ): Promise<ContractTransaction> {
    const sender = await this.signer.getAddress();
    const sourceChainId = computeChainIdType(ChainType.EVM, await this.signer.getChainId());

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

    let extAmount = BigNumber.from(0)
      .add(outputs.reduce((sum: BigNumber, x: Utxo) => sum.add(x.amount), BigNumber.from(0)))
      .sub(inputs.reduce((sum: BigNumber, x: Utxo) => sum.add(x.amount), BigNumber.from(0)));

    const { extData, publicInputs } = await this.setupTransaction(
      inputs,
      outputs,
      extAmount,
      0,
      sender,
      sender,
      leavesMap,
      provingKey,
      circuitWasm
    );

    // A deposit is meant for the same recipient as signer
    const tx = await this.inner.transact(
      {
        ...publicInputs,
        outputCommitments: [publicInputs.outputCommitments[0], publicInputs.outputCommitments[1]],
      },
      extData
    );

    return tx;
  }

  async wrapAndDeposit(utxo: Utxo, tokenAddress: string) {
    const sender = await this.signer.getAddress();

    // const tx = await this._contract.transactWrap();

    console.log('transactWrap not implemented');
  }

  // Verify the leaf occurred at the reported block
  // This is important to check the behavior of relayers before modifying local storage
  async leafCreatedAtBlock(leaf: string, blockNumber: number): Promise<boolean> {
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
    finalBlock: number
  ): Promise<{ lastQueriedBlock: number; newLeaves: string[] }> {
    const filter = this._contract.filters.NewCommitment(null, null, null);

    logger.trace('Getting leaves with filter', filter);
    finalBlock = finalBlock || (await this.web3Provider.getBlockNumber());
    logger.info(`finalBlock detected as: ${finalBlock}`);

    let logs: Array<Log> = []; // Read the stored logs into this variable
    const step = 1024;

    logger.info(`Fetching leaves with steps of ${step} logs/request`);

    try {
      for (let i = startingBlock; i < finalBlock; i += step) {
        const nextLogs = await retryPromise(() => {
          return this.web3Provider.getLogs({
            fromBlock: i,
            toBlock: finalBlock - i > step ? i + step : finalBlock,
            ...filter,
          });
        });

        logs = [...logs, ...nextLogs];

        logger.log(`Getting logs for block range: ${i} through ${i + step}`);
      }
    } catch (e) {
      logger.error(e);
      throw e;
    }

    const events = logs.map((log) => this._contract.interface.parseLog(log));

    const newCommitments = events
      .sort((a, b) => a.args.index - b.args.index) // Sort events in chronological order
      .map((e) => e.args.commitment);

    return {
      lastQueriedBlock: finalBlock,
      newLeaves: newCommitments,
    };
  }

  async generateLinkedMerkleProof(sourceDeposit: IAnchorDepositInfo, sourceLeaves: string[], sourceChainId: number) {
    // Grab the root of the source chain to prove against
    const edgeIndex = await this._contract.edgeIndex(sourceChainId);
    const edge = await this._contract.edgeList(edgeIndex);

    const latestSourceRoot = edge[1];

    const levels = await this._contract.levels();
    const tree = MerkleTree.createTreeWithRoot(levels, sourceLeaves, latestSourceRoot);

    if (tree) {
      const index = tree.getIndexByElement(sourceDeposit.commitment);

      const path = tree.path(index);

      return {
        index: index,
        path: path,
      };
    }

    return undefined;
  }

  async getRootsForProof(): Promise<string[]> {
    const neighborEdges = await this._contract.getLatestNeighborEdges();
    const neighborRoots = neighborEdges.map((rootData) => {
      return rootData.root;
    });
    let thisRoot = await this._contract.getLastRoot();
    return [thisRoot, ...neighborRoots];
  }

  public async setupTransaction(
    inputs: Utxo[],
    outputs: [Utxo, Utxo],
    extAmount: BigNumberish,
    fee: BigNumberish,
    recipient: string,
    relayer: string,
    leavesMap: Record<string, Uint8Array[]>,
    provingKey: Uint8Array,
    wasmBuffer: Buffer
  ) {
    const chainId = computeChainIdType(ChainType.EVM, await this.signer.getChainId());
    const roots = await this.getRootsForProof();

    // Start creating notes to satisfy vanchor input
    // Only the sourceChainId and secrets (amount, nullifier, secret, blinding)
    // is required
    let inputNotes: Note[] = [];
    let inputIndices: number[] = [];

    // calculate the sum of input notes (for calculating the public amount)
    let sumInputNotes: BigNumberish = 0;

    for (const inputUtxo of inputs) {
      console.log('inputUtxo.amount: ', inputUtxo.amount);
      sumInputNotes = BigNumber.from(sumInputNotes).add(inputUtxo.amount);

      // secrets should be formatted as expected in the wasm-utils for note generation
      const secrets =
        `${toFixedHex(inputUtxo.chainId, 8).slice(2)}:` +
        `${toFixedHex(inputUtxo.amount).slice(2)}:` +
        `${toFixedHex(inputUtxo.secret_key).slice(2)}:` +
        `${toFixedHex(inputUtxo.blinding).slice(2)}`;

      const token = await this.getWebbToken();
      const tokenSymbol = await token.symbol();

      const noteInput: NoteGenInput = {
        amount: inputUtxo.amount.toString(),
        backend: 'Circom',
        curve: 'Bn254',
        denomination: '18', // assumed erc20
        exponentiation: '5',
        hashFunction: 'Poseidon',
        index: inputUtxo.index,
        protocol: 'vanchor',
        secrets,
        sourceChain: inputUtxo.originChainId ? inputUtxo.originChainId.toString() : chainId.toString(),
        sourceIdentifyingData: '0',
        targetChain: chainId.toString(),
        targetIdentifyingData: this.inner.address,
        tokenSymbol,
        width: '5',
      };

      console.log('noteInput: ', noteInput);

      const inputNote = await Note.generateNote(noteInput);
      console.log('after generating the note for input');
      inputNotes.push(inputNote);
      console.log('inputUtxo.index: ', inputUtxo.index);
      inputIndices.push(inputUtxo.index);
    }

    console.log('before encrypting the output utxos');

    const encryptedCommitments: [Uint8Array, Uint8Array] = [
      hexToU8a(outputs[0].encrypt()),
      hexToU8a(outputs[1].encrypt()),
    ];

    console.log('after encrypting the output utxos');
    console.log(inputNotes);

    const proofInput: ProvingManagerSetupInput<'vanchor'> = {
      inputNotes,
      leavesMap,
      indices: inputIndices,
      roots: roots.map((root) => hexToU8a(root)),
      chainId: chainId.toString(),
      output: outputs,
      encryptedCommitments,
      publicAmount: BigNumber.from(extAmount).sub(fee).add(FIELD_SIZE).mod(FIELD_SIZE).toString(),
      provingKey,
      relayer: hexToU8a(relayer),
      recipient: hexToU8a(recipient),
      extAmount: toFixedHex(BigNumber.from(extAmount)),
      fee: BigNumber.from(fee).toString(),
    };

    inputNotes.map((note) => console.log('note: ', note.serialize()));
    console.log('proofInput in protocol-solidity: ', proofInput);

    const levels = await this.inner.levels();
    const provingManager = new CircomProvingManager(wasmBuffer, levels, null);
    const proof = await provingManager.prove('vanchor', proofInput);

    const publicInputs: IVariableAnchorPublicInputs = this.generatePublicInputs(
      proof.proof,
      roots,
      inputs,
      outputs,
      proofInput.publicAmount,
      u8aToHex(proof.extDataHash)
    );

    console.log('publicInputs: ', publicInputs);

    const extData = {
      recipient: toFixedHex(proofInput.recipient, 20),
      extAmount: toFixedHex(proofInput.extAmount),
      relayer: toFixedHex(proofInput.relayer, 20),
      fee: toFixedHex(proofInput.fee),
      encryptedOutput1: u8aToHex(proofInput.encryptedCommitments[0]),
      encryptedOutput2: u8aToHex(proofInput.encryptedCommitments[1]),
    };

    console.log('extData: ', extData);

    return {
      extData,
      publicInputs,
      outputNotes: proof.outputNotes,
    };
  }

  public generatePublicInputs(
    proof: any,
    roots: string[],
    inputs: Utxo[],
    outputs: Utxo[],
    publicAmount: BigNumberish,
    extDataHash: string
  ): IVariableAnchorPublicInputs {
    // public inputs to the contract
    const args: IVariableAnchorPublicInputs = {
      proof: `0x${proof}`,
      roots: `0x${roots.map((x) => toFixedHex(x).slice(2)).join('')}`,
      inputNullifiers: inputs.map((x) => toFixedHex(x.nullifier)),
      outputCommitments: [toFixedHex(u8aToHex(outputs[0].commitment)), toFixedHex(u8aToHex(outputs[1].commitment))],
      publicAmount: toFixedHex(publicAmount),
      extDataHash: toFixedHex(extDataHash),
    };

    return args;
  }
}
