import { useApi, useCall } from '@webb-dapp/react-hooks';
import { Balance, MixerInfo } from '@webb-tools/types/interfaces';
import { useMemo } from 'react';

import { currencyId2Token, Token } from '@webb-tools/sdk-core';
import { StorageKey } from '@polkadot/types';

import { mixerLogger } from '../utils';
import { CurrencyId } from '@webb-tools/types/interfaces/types';
import { ApiRx } from '@polkadot/api';

export type MixerGroupItem = {
  id: number;
  currencyId: number;
  token: Token;
  amount: Balance;
};
export type MixerGroupEntry = [StorageKey, MixerInfo];

/**
 * Class representing {[StorageKey, MixerInfo][]} with a native js types
 * */
export class MixerGroupEntriesWrapper {
  constructor(private _inner?: MixerGroupEntry[], private _api: ApiRx) {}

  get inner() {
    return this._inner || [];
  }

  /**
   * Tell wither  inner type exists or not
   * */
  get ready() {
    return Boolean(this._inner);
  }

  /**
   * @param {MixerGroupEntry} entry - which equal to  [StorageKey, MixerInfo]
   * @return {MixerGroupItem}
   * */
  public entryIntoItem(entry: MixerGroupEntry): MixerGroupItem {
    return {
      amount: entry[1]['fixed_deposit_size'],
      currencyId: entry[1]['currency_id'].toNumber(),
      token: this.currencyIdIntoToken(entry[1]['currency_id']),
      id: Number((entry[0].toHuman() as any[])[0]),
    };
  }

  get items(): MixerGroupItem[] {
    return this.inner.map(this.entryIntoItem, this);
  }

  getItemsOf(currencyId: CurrencyId | undefined): MixerGroupItem[] {
    const cid = currencyId ?? this._api.createType('CurrencyId', 0);
    return this.inner.map(this.entryIntoItem, this).filter((item) => {
      return item.token.symbol === this.currencyIdIntoToken(cid).symbol;
    });
  }

  get currencyIds() {
    let currencyIds: number[] = [];
    this.items.forEach((item) => {
      if (currencyIds.includes(item.currencyId)) {
        return;
      }
      currencyIds.push(item.currencyId);
    });
    // @ts-ignore
    return currencyIds.map((id) => this._api.createType('CurrencyId', id) as CurrencyId);
  }
  private currencyIdIntoToken(currencyId: CurrencyId) {
    const token = currencyId2Token(currencyId);

    return (
      token ??
      new Token({
        amount: 0,
        chain: 'edgeware',
        precision: 18,
        symbol: 'WEBB',
        name: 'Weebtoken',
      })
    );
  }
  get currencyTokens() {
    return this.currencyIds.map(this.currencyIdIntoToken, this);
  }
  getSelect(item: MixerGroupItem) {
    return this.inner.find((mixerGroupEntry) => {
      const number = this.entryIntoItem(mixerGroupEntry);
      return number.toString() === item.amount.toString();
    });
  }
}

/**
 * UseMixerGroupsEntries
 *  @description   This will issue an RPC call to query.mixer.mixerGroups.entries return wrapper type around [StorageKey, MixerInfo]
 *  @return {MixerGroupEntriesWrapper}
 * */
export const useMixerGroupsEntries = (): MixerGroupEntriesWrapper => {
  const mixerGroups = useCall<Array<MixerGroupEntry>>('query.mixer.mixerTrees.entries', [], undefined, []);
  const { api } = useApi();

  return useMemo(() => {
    mixerLogger.debug(`MixerGroupEntry `, mixerGroups);
    return new MixerGroupEntriesWrapper(mixerGroups, api);
  }, [mixerGroups]);
};
