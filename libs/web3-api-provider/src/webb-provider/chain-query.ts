// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { ChainQuery } from '@webb-tools/abstract-api-provider';
import { ERC20__factory as ERC20Factory } from '@webb-tools/contracts';
import {
  ensureHex,
  getNativeCurrencyFromConfig,
} from '@webb-tools/dapp-config';
import { zeroAddress } from '@webb-tools/dapp-types';
import { Observable, catchError, of, switchMap } from 'rxjs';
import { Address, formatEther, getContract } from 'viem';
import { WebbWeb3Provider } from '../webb-provider';

export class Web3ChainQuery extends ChainQuery<WebbWeb3Provider> {
  constructor(protected inner: WebbWeb3Provider) {
    super(inner);
  }

  currentBlock() {
    return this.inner.publicClient.getBlockNumber();
  }

  // Returns the balance formatted in ETH units.
  tokenBalanceByCurrencyId(
    typedChainId: number,
    currencyId: number,
    accountAddressArg?: string
  ): Observable<string> {
    return this.inner.newBlock.pipe(
      switchMap(async () => {
        const account = await this.getAccountAddress(accountAddressArg);
        if (!account) {
          console.error('No account selected');
          return '';
        }

        const accountAddress: Address = ensureHex(account);

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
          const tokenBalanceBig = await this.inner.publicClient.getBalance({
            address: accountAddress,
            blockTag: 'latest',
          });
          const tokenBalance = formatEther(tokenBalanceBig);

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
          const tokenInstance = getContract({
            address: ensureHex(currencyOnChain),
            abi: ERC20Factory.abi,
            publicClient: this.inner.publicClient,
          });
          const tokenBalanceBig = await tokenInstance.read.balanceOf(
            [accountAddress],
            {
              blockTag: 'latest',
            }
          );
          const tokenBalance = formatEther(tokenBalanceBig);

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
    return this.inner.newBlock.pipe(
      switchMap(async () => {
        const account = await this.getAccountAddress(accountAddressArg);

        if (!account) {
          console.error('no account selected');
          return '';
        }

        const accountAddress: Address = ensureHex(account);

        // Return the balance of the account if native currency
        if (address === zeroAddress) {
          const tokenBalanceBig = await this.inner.publicClient.getBalance({
            address: accountAddress,
            blockTag: 'latest',
          });
          const tokenBalance = formatEther(tokenBalanceBig);

          return tokenBalance;
        } else {
          // Create a token instance for this chain
          const tokenInstance = getContract({
            address: ensureHex(address),
            abi: ERC20Factory.abi,
            publicClient: this.inner.publicClient,
          });

          const tokenBalanceBig = await tokenInstance.read.balanceOf(
            [accountAddress],
            {
              blockTag: 'latest',
            }
          );

          const tokenBalance = formatEther(tokenBalanceBig);

          return tokenBalance;
        }
      }),
      catchError(() => of('')) // Return empty string when error
    );
  }

  private async getAccountAddress(
    accAddr?: string
  ): Promise<string | undefined> {
    return accAddr ?? this.inner.accounts.activeOrDefault?.address;
  }
}
