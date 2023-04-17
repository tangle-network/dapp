// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { ChainQuery } from '@webb-tools/abstract-api-provider';
import { zeroAddress } from '@webb-tools/dapp-types';
import { ERC20__factory as ERC20Factory } from '@webb-tools/contracts';

import { ethers } from 'ethers';

import { WebbWeb3Provider } from '../webb-provider';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { getNativeCurrencyFromConfig } from '@webb-tools/dapp-config';

export class Web3ChainQuery extends ChainQuery<WebbWeb3Provider> {
  constructor(protected inner: WebbWeb3Provider) {
    super(inner);
  }

  async currentBlock(): Promise<number> {
    const provider = this.inner.getEthersProvider();
    return provider.getBlockNumber();
  }

  // Returns the balance formatted in ETH units.
  tokenBalanceByCurrencyId(
    typedChainId: number,
    currencyId: number,
    accountAddressArg?: string
  ): Observable<string> {
    const provider = this.inner.getEthersProvider();
    return this.inner.newBlock.pipe(
      switchMap(async () => {
        const accountAddress = await this.getAccountAddress(accountAddressArg);
        if (!accountAddress) {
          console.error('No account selected');
          return '';
        }

        const nativeCurrency = getNativeCurrencyFromConfig(
          this.inner.config.currencies,
          typedChainId
        );

        if (!nativeCurrency) {
          console.error('No native currency found for chain');
          return '';
        }

        // Return the balance of the account if native currency
        if (nativeCurrency.id === currencyId) {
          const tokenBalanceBig = await provider.getBalance(accountAddress);
          const tokenBalance = ethers.utils.formatEther(tokenBalanceBig);

          return tokenBalance;
        } else {
          // Find the currency address on this chain
          const currency = this.inner.state.getCurrencies()[currencyId];
          if (!currency) {
            return '';
          }

          const currencyOnChain = currency.getAddress(typedChainId);
          if (!currencyOnChain) {
            return '';
          }

          // Create a token instance for this chain
          const tokenInstance = ERC20Factory.connect(currencyOnChain, provider);
          const tokenBalanceBig = await tokenInstance.balanceOf(accountAddress);
          const tokenBalance = ethers.utils.formatEther(tokenBalanceBig);

          return tokenBalance;
        }
      }),
      catchError(() => of('')) // Return empty string when error
    );
  }

  tokenBalanceByAddress(
    address: string,
    accountAddressArg?: string
  ): Observable<string> {
    const provider = this.inner.getEthersProvider();
    return this.inner.newBlock.pipe(
      switchMap(async () => {
        const accountAddress = await this.getAccountAddress(accountAddressArg);

        if (!accountAddress) {
          console.log('no account selected');
          return '';
        }

        // Return the balance of the account if native currency
        if (address === zeroAddress) {
          const tokenBalanceBig = await provider.getBalance(accountAddress);
          const tokenBalance = ethers.utils.formatEther(tokenBalanceBig);

          return tokenBalance;
        } else {
          // Create a token instance for this chain
          const tokenInstance = ERC20Factory.connect(address, provider);
          const tokenBalanceBig = await tokenInstance.balanceOf(accountAddress);
          const tokenBalance = ethers.utils.formatEther(tokenBalanceBig);

          return tokenBalance;
        }
      }),
      catchError(() => of('')) // Return empty string when error
    );
  }

  private async getAccountAddress(
    accAddr?: string
  ): Promise<string | undefined> {
    if (accAddr) {
      return accAddr;
    }

    const accounts = await this.inner.accounts.accounts();
    if (!accounts?.length) {
      return undefined;
    }

    return accounts[0]?.address;
  }
}
