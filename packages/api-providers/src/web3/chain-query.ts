// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { ERC20__factory as ERC20Factory } from '@webb-tools/contracts';
import { ethers } from 'ethers';

import { ChainQuery } from '../abstracts';
import { InternalChainId } from '../chains';
import { zeroAddress } from '../contracts';
import { WebbCurrencyId } from '../enums';
import { Currency } from '../';
import { WebbWeb3Provider } from './webb-provider';

export class Web3ChainQuery extends ChainQuery<WebbWeb3Provider> {
  constructor(protected inner: WebbWeb3Provider) {
    super(inner);
  }

  private get config() {
    return this.inner.config;
  }

  async tokenBalanceByCurrencyId(chainId: InternalChainId, currencyId: WebbCurrencyId): Promise<string> {
    const provider = this.inner.getEthersProvider();

    // check if the token is the native token of this chain

    const accounts = await this.inner.accounts.accounts();

    if (!accounts || !accounts.length) {
      console.log('no account selected');

      return '';
    }

    // Return the balance of the account if native currency
    if (this.config.chains[chainId].nativeCurrencyId === currencyId) {
      const tokenBalanceBig = await provider.getBalance(accounts[0].address);
      const tokenBalance = ethers.utils.formatEther(tokenBalanceBig);

      return tokenBalance;
    } else {
      // Find the currency address on this chain
      const currency = Currency.fromCurrencyId(this.inner.config.currencies, currencyId);
      const currencyOnChain = currency.getAddress(chainId);

      if (!currencyOnChain) {
        return '';
      }

      // Create a token instance for this chain
      const tokenInstance = ERC20Factory.connect(currencyOnChain, provider);
      const tokenBalanceBig = await tokenInstance.balanceOf(accounts[0].address);
      const tokenBalance = ethers.utils.formatEther(tokenBalanceBig);

      return tokenBalance;
    }
  }

  async tokenBalanceByAddress(address: string): Promise<string> {
    const provider = this.inner.getEthersProvider();

    const accounts = await this.inner.accounts.accounts();

    if (!accounts || !accounts.length) {
      console.log('no account selected');

      return '';
    }

    // Return the balance of the account if native currency
    if (address === zeroAddress) {
      const tokenBalanceBig = await provider.getBalance(accounts[0].address);
      const tokenBalance = ethers.utils.formatEther(tokenBalanceBig);

      return tokenBalance;
    } else {
      // Create a token instance for this chain
      const tokenInstance = ERC20Factory.connect(address, provider);
      const tokenBalanceBig = await tokenInstance.balanceOf(accounts[0].address);
      const tokenBalance = ethers.utils.formatEther(tokenBalanceBig);

      return tokenBalance;
    }
  }
}
