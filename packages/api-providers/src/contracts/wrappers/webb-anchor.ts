// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable camelcase */

import { Log } from '@ethersproject/abstract-provider';
import { Anchor } from '@webb-tools/anchors';
import { LoggerService } from '@webb-tools/app-util';
import {
  ERC20,
  ERC20__factory as ERC20Factory,
  FixedDepositAnchor,
  FixedDepositAnchor__factory,
} from '@webb-tools/contracts';
import { IAnchorDepositInfo } from '@webb-tools/interfaces';
import { MerkleTree } from '@webb-tools/sdk-core';
import { getFixedAnchorExtDataHash, toFixedHex } from '@webb-tools/utils';
import { BigNumber, Contract, providers, Signer } from 'ethers';

import { retryPromise } from '../../';
import { zeroAddress } from '..';
import { ZKPWebbAnchorInputWithMerkle } from './types';

const logger = LoggerService.get('AnchorContract');

export interface IFixedAnchorPublicInputs {
  _roots: string;
  _nullifierHash: string;
  _refreshCommitment: string;
  _recipient: string;
  _relayer: string;
  _fee: string;
  _refund: string;
}

// The AnchorContract defines useful functions over an anchor that do not depend on zero knowledge.
export class AnchorContract {
  private _contract: FixedDepositAnchor;
  private readonly signer: Signer;

  constructor(private web3Provider: providers.Web3Provider, address: string, useProvider = false) {
    this.signer = this.web3Provider.getSigner();
    logger.info(`Init with address ${address} `);
    this._contract = FixedDepositAnchor__factory.connect(address, useProvider ? this.web3Provider : this.signer);
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

  async getDenomination() {
    return this._contract.denomination();
  }

  async getEvmId() {
    return this.web3Provider.getSigner().getChainId();
  }

  async getWebbToken(): Promise<ERC20> {
    const tokenAddress = await this._contract.token();
    const tokenInstance = ERC20Factory.connect(tokenAddress, this.signer);

    return tokenInstance;
  }

  async isWebbTokenApprovalRequired() {
    const userAddress = await this.signer.getAddress();
    const tokenInstance = await this.getWebbToken();
    const tokenAllowance = await tokenInstance.allowance(userAddress, this._contract.address);
    const depositAmount = await this.getDenomination();

    logger.log('tokenAllowance', tokenAllowance);
    logger.log('depositAmount', depositAmount);

    if (tokenAllowance < depositAmount) {
      return true;
    }

    return false;
  }

  async isWrappableTokenApprovalRequired(tokenAddress: string) {
    // Native token never requires approval
    if (tokenAddress === zeroAddress) {
      return false;
    }

    const userAddress = await this.signer.getAddress();
    const webbToken = await this.getWebbToken();
    const tokenAllowance = await webbToken.allowance(userAddress, webbToken.address);
    const depositAmount = await this.getDenomination();

    if (tokenAllowance < depositAmount) {
      return true;
    }

    return false;
  }

  async hasEnoughBalance(tokenAddress?: string) {
    const userAddress = await this.signer.getAddress();
    const depositAmount = await this.getDenomination();
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

    if (tokenBalance < depositAmount) {
      return false;
    }

    return true;
  }

  async approve(tokenInstance: Contract) {
    // check the approved spending before attempting deposit
    if (tokenInstance == null) {
      return;
    }

    if (tokenInstance != null) {
      const depositAmount = await this.getDenomination();
      const tx = await tokenInstance.approve(this._contract.address, depositAmount);

      await tx.wait();
    }
  }

  async deposit(commitment: string) {
    const overrides = {};
    const recipient = await this._contract.deposit(toFixedHex(commitment), overrides);

    await recipient.wait();
  }

  async wrapAndDeposit(commitment: string, tokenAddress: string) {
    const value = await this._contract.denomination();

    if (tokenAddress === zeroAddress) {
      const overrides = { value: value };

      const tx = await this._contract.wrapAndDeposit(zeroAddress, toFixedHex(commitment), overrides);

      await tx.wait();
      logger.log('wrapAndDeposit completed for native token to webb token');
    } else {
      const overrides = {};

      const tx = await this._contract.wrapAndDeposit(tokenAddress, toFixedHex(commitment), overrides);

      await tx.wait();
      logger.log('wrapAndDeposit completed for wrappable asset to webb token');
    }
  }

  // Verify the leaf occurred at the reported block
  // This is important to check the behavior of relayers before modifying local storage
  async leafCreatedAtBlock(leaf: string, blockNumber: number): Promise<boolean> {
    const filter = this._contract.filters.Deposit(null, null, null);
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
    const filter = this._contract.filters.Deposit(null, null, null);

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
      .sort((a, b) => a.args.leafIndex - b.args.leafIndex) // Sort events in chronological order
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
    const overrides = {
      gasLimit: 6000000,
    };
    const proofBytes = await Anchor.generateWithdrawProofCallData(proof, pub);
    const nullifierHash = toFixedHex(zkp.nullifierHash);
    const roots = Anchor.createRootsBytes(pub.roots);
    const extDataHash = getFixedAnchorExtDataHash({
      _fee: toFixedHex(zkp.fee),
      _recipient: zkp.recipient,
      _refreshCommitment: toFixedHex('0'),
      _refund: toFixedHex(zkp.refund),
      _relayer: zkp.relayer,
    });
    const tx = await this._contract.withdraw(
      {
        _extDataHash: extDataHash.toHexString(),
        _nullifierHash: nullifierHash,
        _roots: roots,
        proof: `0x${proofBytes}`,
      },
      {
        _fee: toFixedHex(zkp.fee),
        _recipient: zkp.recipient,
        _refreshCommitment: toFixedHex('0'),
        _refund: toFixedHex(zkp.refund),
        _relayer: zkp.relayer,
      },
      overrides
    );
    const receipt = await tx.wait();

    return receipt.transactionHash;
  }

  /* wrap and unwrap */
}
