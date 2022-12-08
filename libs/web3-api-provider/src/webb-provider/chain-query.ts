// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { ChainQuery } from '@webb-tools/abstract-api-provider';
import { zeroAddress } from '@webb-tools/dapp-types';
import { ERC20__factory as ERC20Factory } from '@webb-tools/contracts';
import { ethers } from 'ethers';

import { WebbWeb3Provider } from '../webb-provider';
import { Observable, switchMap } from 'rxjs';

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
    currencyId: number
  ): Observable<string> {
    const provider = this.inner.getEthersProvider();
    return this.inner.newBlock.pipe(
      switchMap(async () => {
        // check if the token is the native token of this chain

        const accounts = await this.inner.accounts.accounts();

        if (!accounts || !accounts.length) {
          console.log('no account selected');

          return '';
        }

        // Return the balance of the account if native currency
        if (
          this.inner.config.chains[typedChainId].nativeCurrencyId === currencyId
        ) {
          const tokenBalanceBig = await provider.getBalance(
            accounts[0].address
          );
          const tokenBalance = ethers.utils.formatEther(tokenBalanceBig);

          return tokenBalance;
        } else {
          // Find the currency address on this chain
          const currency = this.inner.state.getCurrencies()[currencyId];
          if (!currency) {
            console.log(
              `could not find currencyId ${currencyId} in supportedCurrencies`
            );
            return '';
          }

          const currencyOnChain = currency.getAddress(typedChainId);
          if (!currencyOnChain) {
            return '';
          }

          // Create a token instance for this chain
          const tokenInstance = ERC20Factory.connect(currencyOnChain, provider);
          const tokenBalanceBig = await tokenInstance.balanceOf(
            accounts[0].address
          );
          const tokenBalance = ethers.utils.formatEther(tokenBalanceBig);

          return tokenBalance;
        }
      })
    );
  }

  tokenBalanceByAddress(address: string): Observable<string> {
    const provider = this.inner.getEthersProvider();
    return this.inner.newBlock.pipe(
      switchMap(async () => {
        const accounts = await this.inner.accounts.accounts();

        if (!accounts || !accounts.length) {
          console.log('no account selected');

          return '';
        }

        // Return the balance of the account if native currency
        if (address === zeroAddress) {
          const tokenBalanceBig = await provider.getBalance(
            accounts[0].address
          );
          const tokenBalance = ethers.utils.formatEther(tokenBalanceBig);

          return tokenBalance;
        } else {
          // Create a token instance for this chain
          const tokenInstance = ERC20Factory.connect(address, provider);
          const tokenBalanceBig = await tokenInstance.balanceOf(
            accounts[0].address
          );
          const tokenBalance = ethers.utils.formatEther(tokenBalanceBig);

          return tokenBalance;
        }
      })
    );
  }
}
