import { Currency } from '@webb-dapp/mixer/utils/currency';
import { Token } from '@webb-tools/sdk-core';
import { Balance, MixerInfo } from '@webb-tools/types/interfaces';
import { CurrencyId } from '@webb-tools/types/interfaces/types';

import { ApiPromise, ApiRx } from '@polkadot/api';
import { StorageKey } from '@polkadot/types';

export type NativeTokenProperties = {
  ss58Format: number | null;
  tokenDecimals: Array<number> | null;
  tokenSymbol: Array<string> | null;
};

export type MixerGroupItem = {
  id: number;
  amount: Balance;
  currency: Currency;
  token: Token;
};
export type MixerGroupEntry = [StorageKey, MixerInfo];

/**
 * Class representing {[StorageKey, MixerInfo][]} with a native js types
 * */
export class MixerGroupEntriesWrapper {
  constructor(
    private _inner: MixerGroupEntry[] | undefined,
    private tokenProperty: NativeTokenProperties | undefined,
    private _api: ApiRx | ApiPromise
  ) {}

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
    const cId: number = entry[1]['currency_id'].toNumber();
    const amount = entry[1]['fixed_deposit_size'];

    return {
      amount: amount,
      currency: Currency.fromCurrencyId(cId, this._api, 0),
      id: Number((entry[0].toHuman() as any[])[0]),
      token: new Token({
        amount: amount.toString(),
        // TODO: Pull from active chain
        chain: 'edgeware',
        name: 'DEV',
        // @ts-ignore
        precision: Number(this.tokenProperty?.toHuman().tokenDecimals?.[0] ?? 12),
        symbol: 'EDG',
      }),
    };
  }

  get items(): MixerGroupItem[] {
    return this.inner.map(this.entryIntoItem, this);
  }

  getItemsOf(currencyId: CurrencyId | number = 0): MixerGroupItem[] {
    const selectedSymbol = Currency.fromCurrencyId(currencyId, this._api).token.symbol;
    return this.inner.map(this.entryIntoItem, this).filter((item) => {
      return item.currency.token.symbol === selectedSymbol;
    });
  }

  get currencies(): Currency[] {
    const currencies: Currency[] = [];
    this.items.forEach((item) => {
      const symbol = item.currency.symbol;
      const alreadyIn = currencies.findIndex((c) => c.symbol === symbol) > -1;
      if (!alreadyIn) {
        currencies.push(item.currency);
      }
    });
    return currencies;
  }

  getSelect(item: MixerGroupItem) {
    return this.inner.find((mixerGroupEntry) => {
      const number = this.entryIntoItem(mixerGroupEntry);
      return number.toString() === item.amount.toString();
    });
  }
}
