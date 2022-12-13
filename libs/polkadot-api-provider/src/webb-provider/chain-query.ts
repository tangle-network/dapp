// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { ChainQuery } from '@webb-tools/abstract-api-provider';
import { CurrencyId } from '@webb-tools/dapp-types';

import { SignedBlock } from '@polkadot/types/interfaces';
import { OrmlTokensAccountData } from '@polkadot/types/lookup';

import { WebbPolkadot } from '../webb-provider';
import { Observable, switchMap, throwError } from 'rxjs';

export class PolkadotChainQuery extends ChainQuery<WebbPolkadot> {
  constructor(protected inner: WebbPolkadot) {
    super(inner);
  }

  async currentBlock(): Promise<number> {
    const block: SignedBlock = await this.inner.api.rpc.chain.getBlock();
    return block.block.header.number.toNumber();
  }

  private getTokenBalanceByAssetId(assetId: string): Observable<string> {
    return this.inner.newBlock.pipe(
      switchMap(async () => {
        const activeAccount = await this.inner.accounts.activeOrDefault;
        if (activeAccount) {
          // If the assetId is not 0, query the orml tokens
          if (assetId !== '0') {
            let tokenAccountData: OrmlTokensAccountData;

            try {
              tokenAccountData = await this.inner.api.query.tokens.accounts(
                activeAccount.address,
                assetId
              );
            } catch (e) {
              // It is possible that we have connected to a chain that is not setup with orml tokens.
              return '';
            }

            const json = tokenAccountData;

            let tokenBalance: string = json.free.toString();

            tokenBalance = tokenBalance.replaceAll(',', '');
            const denominatedTokenBalance = Number(tokenBalance) / 10 ** 12;

            return denominatedTokenBalance.toString();
          } else {
            const systemAccountData = await this.inner.api.query.system.account(
              activeAccount.address
            );

            let tokenBalance: string = systemAccountData.data.free.toString();

            tokenBalance = tokenBalance.replaceAll(',', '');
            const denominatedTokenBalance = Number(tokenBalance) / 10 ** 12;

            return denominatedTokenBalance.toString();
          }
        }

        return '';
      })
    );
  }

  tokenBalanceByCurrencyId(
    typedChainId: number,
    currency: CurrencyId
  ): Observable<string> {
    const assetId =
      this.inner.config.currencies[currency].addresses.get(typedChainId);
    if (!assetId) {
      return throwError(`unable to find asset`);
    }
    return this.getTokenBalanceByAssetId(assetId);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tokenBalanceByAddress(address: string): Observable<string> {
    return this.getTokenBalanceByAssetId(address);
  }
}
