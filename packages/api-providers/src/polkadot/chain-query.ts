// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { ChainQuery } from '../abstracts';
import { WebbCurrencyId } from '../enums';
import { InternalChainId } from '..';
import { WebbPolkadot } from './webb-provider';

export class PolkadotChainQuery extends ChainQuery<WebbPolkadot> {
  constructor(protected inner: WebbPolkadot) {
    super(inner);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async tokenBalanceByCurrencyId(chainId: InternalChainId, currency: WebbCurrencyId): Promise<string> {
    const assetId = this.inner.config.currencies[currency].addresses.get(chainId);

    const activeAccount = await this.inner.accounts.activeOrDefault;

    if (activeAccount) {
      // If the assetId is not 0, query the orml tokens
      if (assetId !== '0') {
        const tokenAccountData = await this.inner.api.query.tokens.accounts(activeAccount.address, assetId);

        const json = tokenAccountData.toHuman();

        // @ts-ignore
        let tokenBalance: string = json.free;

        tokenBalance = tokenBalance.replaceAll(',', '');
        const denominatedTokenBalance = Number(tokenBalance) / 10 ** 12;

        return denominatedTokenBalance.toString();
      } else {
        const systemAccountData = await this.inner.api.query.system.account(activeAccount.address);

        const json = systemAccountData.toHuman();

        // @ts-ignore
        let tokenBalance: string = json.data.free;

        tokenBalance = tokenBalance.replaceAll(',', '');
        const denominatedTokenBalance = Number(tokenBalance) / 10 ** 12;

        return denominatedTokenBalance.toString();
      }
    }

    return '';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async tokenBalanceByAddress(address: string): Promise<string> {
    return '';
  }
}
