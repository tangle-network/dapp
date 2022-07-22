// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { SignedBlock } from '@polkadot/types/interfaces';

import { ChainQuery } from '../abstracts';
import { CurrencyId } from '../enums';
import { WebbPolkadot } from './webb-provider';

export class PolkadotChainQuery extends ChainQuery<WebbPolkadot> {
  constructor(protected inner: WebbPolkadot) {
    super(inner);
  }

  async currentBlock(): Promise<number> {
    const block: SignedBlock = await this.inner.api.rpc.chain.getBlock();
    return block.block.header.number.toNumber();
  }

  async tokenBalanceByCurrencyId(typedChainId: number, currency: CurrencyId): Promise<string> {
    const assetId = this.inner.config.currencies[currency].addresses.get(typedChainId);

    const activeAccount = await this.inner.accounts.activeOrDefault;

    if (activeAccount) {
      // If the assetId is not 0, query the orml tokens
      if (assetId !== '0') {
        console.log('ActiveAccount address in polkadot chain query: ', activeAccount.address, assetId);
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
