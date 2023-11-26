// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { ChainQuery } from '@webb-tools/abstract-api-provider';
import { ensureHex } from '@webb-tools/dapp-config';
import { checkNativeAddress } from '@webb-tools/dapp-types';
import { parseTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
import { Observable, catchError, of, switchMap } from 'rxjs';
import { Address, formatEther } from 'viem';
import { fetchBalance } from 'wagmi/actions';
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
        const currency = this.inner.state.getCurrencies()[currencyId];
        if (!currency) {
          return '';
        }

        const account = await this.getAccountAddress(accountAddressArg);
        if (!account) {
          console.error('No account selected');
          return '';
        }

        const accountAddress: Address = ensureHex(account);
        const tknAddr = currency.getAddressOfChain(typedChainId);

        const balance = await this.fetchAccountBalance(
          accountAddress,
          typedChainId,
          tknAddr ? ensureHex(tknAddr) : undefined
        );

        return formatEther(balance.value);
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
        const tknAddress: Address = ensureHex(address);

        const balance = await this.fetchAccountBalance(
          accountAddress,
          this.inner.typedChainId,
          tknAddress
        );

        return formatEther(balance.value);
      }),
      catchError(() => of('')) // Return empty string when error
    );
  }

  private async getAccountAddress(
    accAddr?: string
  ): Promise<string | undefined> {
    return accAddr ?? this.inner.accounts.activeOrDefault?.address;
  }

  private fetchAccountBalance(
    accountAddress: Address,
    typedChainId: number,
    tokenAddress?: Address
  ) {
    return fetchBalance({
      address: accountAddress,
      chainId: parseTypedChainId(typedChainId).chainId,
      token:
        tokenAddress && !checkNativeAddress(tokenAddress)
          ? tokenAddress
          : undefined,
    });
  }
}
