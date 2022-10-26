// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable camelcase */

import { zeroAddress } from '@nepoche/dapp-types';
import { LoggerService } from '@webb-tools/app-util';
import { GovernedTokenWrapper, GovernedTokenWrapper__factory } from '@webb-tools/contracts';
import { BigNumberish, Contract, PayableOverrides, providers, Signer } from 'ethers';

const logger = LoggerService.get('WebbGovernedToken');

function checkNativeAddress(tokenAddress: string): boolean {
  if (tokenAddress === zeroAddress || tokenAddress === '0') {
    return true;
  }

  return false;
}

export class WebbGovernedToken {
  private _contract: GovernedTokenWrapper;
  private readonly signer: Signer;

  constructor(private web3Provider: providers.Web3Provider, address: string) {
    this.signer = this.web3Provider.getSigner();
    logger.info(`Init with address ${address} `);
    this._contract = new Contract(address, GovernedTokenWrapper__factory.abi, this.signer) as any;
  }

  get address() {
    return this._contract.address;
  }

  get tokens() {
    return this._contract.getTokens();
  }

  async getInfo() {
    const [symbol, name] = await Promise.all([this._contract.symbol(), this._contract.name()]);

    return {
      name,
      symbol,
    };
  }

  getBalanceOf(account: string) {
    return this._contract.balanceOf(account);
  }

  /// todo assume native
  async wrap(address: string, amount: BigNumberish) {
    const isNative = checkNativeAddress(address);
    const amountParam = isNative ? 0 : amount;

    const overrides: PayableOverrides = {
      gasLimit: 6000000,
    };

    if (isNative) {
      overrides.value = amount;
    }

    logger.info(`Wrapping ${isNative ? 'native' : `non-native (${address})`} amount ${amount.toString()}`);

    return this._contract.wrap(address, amountParam, overrides);
  }

  async unwrap(address: string, amount: BigNumberish) {
    const overrides: PayableOverrides = {
      gasLimit: 6000000,
    };

    logger.info(
      `Unwrapping ${checkNativeAddress(address) ? 'native' : `non-native (${address})`} amount ${amount.toString()}`
    );

    return this._contract.unwrap(address, amount, overrides);
  }

  get currentLiquidity() {
    return this._contract.totalSupply();
  }

  get contractBalance() {
    return this.web3Provider.getBalance(this._contract.address);
  }

  async canUnwrap(account: string, amount: BigNumberish) {
    const [currentWrappedLiquidity] = await Promise.all([
      this.currentLiquidity,
      this.web3Provider.getBalance(this._contract.address),
    ]);

    if (currentWrappedLiquidity.lt(amount) || currentWrappedLiquidity.lt(amount)) {
      // no enough liquidity
      return false;
    }

    const userBalance = await this._contract.balanceOf(account);

    if (userBalance.gte(amount)) {
      return true;
    }

    return false;
  }

  async isNativeAllowed() {
    const nativeAllowed = await this._contract.isNativeAllowed();

    return nativeAllowed;
  }

  // Checks if the governed token wraps a particular token.
  // Does NOT check if allowances for ERC20s are satisfied.
  async canwrap(tokenAddress: string) {
    const tokens = await this._contract.getTokens();

    if (tokens.includes(tokenAddress)) {
      return true;
    }

    if (tokenAddress === zeroAddress) {
      return this.isNativeAllowed();
    }

    return false;
  }
}
