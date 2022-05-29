// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable camelcase */

import { Log } from '@ethersproject/abstract-provider';
import { VAnchor as VAnchorWrapper } from '@webb-tools/anchors';
import { LoggerService } from '@webb-tools/app-util';
import { ERC20, ERC20__factory as ERC20Factory, VAnchor, VAnchor__factory } from '@webb-tools/contracts';
import { IAnchorDepositInfo } from '@webb-tools/interfaces';
import { MerkleTree } from '@webb-tools/merkle-tree';
import { Utxo } from '@webb-tools/utils';
import { BigNumber, BigNumberish, Contract, providers, Signer } from 'ethers';

import {
  buildVariableWitness,
  fetchVariableAnchorKeyForEdges,
  fetchVariableAnchorWasmForEdges,
  retryPromise,
} from '../../';
import { zeroAddress } from '..';
import { ZKPWebbAnchorInputWithMerkle } from './types';

const logger = LoggerService.get('AnchorContract');

export interface IVariableAnchorPublicInputs {
  _roots: string;
  _nullifierHash: string;
  _refreshCommitment: string;
  _recipient: string;
  _relayer: string;
  _fee: string;
  _refund: string;
}

// The AnchorContract defines useful functions over an anchor that do not depend on zero knowledge.
export class VAnchorContract {
  public wrapper: VAnchorWrapper | null = null;
  private _contract: VAnchor;
  private readonly signer: Signer;

  constructor(private web3Provider: providers.Web3Provider, address: string, useProvider = false) {
    this.signer = this.web3Provider.getSigner();
    logger.info(`Init with address ${address} `);
    this._contract = VAnchor__factory.connect(address, useProvider ? this.web3Provider : this.signer);
  }

  get getLastRoot() {
    return this._contract.getLastRoot();
  }

  get nextIndex() {
    return this._contract.nextIndex();
  }

  get inner() {
    return this._contract;
  }

  async initializeWrapper() {
    if (!this.wrapper) {
      const maxEdges = await this._contract.maxEdges();

      const smallKey = await fetchVariableAnchorKeyForEdges(maxEdges, true);
      const smallWasm = await fetchVariableAnchorWasmForEdges(maxEdges, true);
      const smallWitnessCalc = await buildVariableWitness(smallWasm, {});

      const largeKey = await fetchVariableAnchorKeyForEdges(maxEdges, false);
      const largeWasm = await fetchVariableAnchorWasmForEdges(maxEdges, false);
      const largeWitnessCalc = await buildVariableWitness(largeWasm, {});

      // Get the necessary fixtures for populating the VAnchor wrapper instance.
      this.wrapper = await VAnchorWrapper.connect(
        this._contract.address,
        {
          wasm: Buffer.from(smallWasm),
          witnessCalculator: smallWitnessCalc,
          zkey: smallKey,
        },
        {
          wasm: Buffer.from(largeWasm),
          witnessCalculator: largeWitnessCalc,
          zkey: largeKey,
        },
        this.web3Provider.getSigner()
      );
    }
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
  async deposit(utxo: Utxo) {
    await this.initializeWrapper();

    if (!this.wrapper) {
      throw new Error('Wrapper failed to initialize for VAnchor');
    }

    const tx = await this.wrapper.transact(
      [],
      [utxo],
      0,
      '0x0000000000000000000000000000000000000001',
      '0x0000000000000000000000000000000000000001'
    );

    console.log(tx);
  }

  async wrapAndDeposit(utxo: Utxo, tokenAddress: string) {
    await this.initializeWrapper();

    if (!this.wrapper) {
      throw new Error('Wrapper failed to initialize for VAnchor');
    }

    const tx = await this.wrapper.transactWrap(
      tokenAddress,
      [],
      [utxo],
      0,
      '0x0000000000000000000000000000000000000001',
      '0x0000000000000000000000000000000000000001'
    );

    console.log('transactWrap: ', tx);
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

  async withdraw(proof: any, zkp: ZKPWebbAnchorInputWithMerkle, pub: any): Promise<string> {
    console.log('withdraw not implemented', proof, zkp, pub);

    return 'unimplemented';
  }

  /* wrap and unwrap */
}
