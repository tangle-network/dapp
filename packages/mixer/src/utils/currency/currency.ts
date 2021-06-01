import { TOKEN_COLOR, TOKEN_FULLNAMES, TOKEN_IMAGES } from '@webb-dapp/mixer/utils/currency/constants';
import { Token } from '@webb-tools/sdk-core';
import { CurrencyId } from '@webb-tools/types/interfaces/types';

import { ApiPromise, ApiRx } from '@polkadot/api';

interface Data {
  currencyId: CurrencyId;
  token: Token;
}

export class Currency {
  private constructor(private _inner: Data, private _apiRx: ApiRx | ApiPromise) {}

  static tokenFrom(currencyId: CurrencyId, amount: number) {
    const id = currencyId?.toNumber() ?? currencyId;
    switch (id) {
      case 0:
        return new Token({
          amount,
          chain: 'edgeware',
          name: 'EDG',
          precision: 18,
          symbol: 'EDG',
        });
      default:
        return new Token({
          amount,
          chain: 'dev',
          name: 'WEBB',
          precision: 18,
          symbol: 'WEBB',
        });
    }
  }

  static fromCurrencyId(currencyId: CurrencyId | number, api: ApiRx | ApiPromise, amount: number = 0): Currency {
    let cid: CurrencyId;
    if (typeof currencyId === 'number') {
      // @ts-ignore
      cid = api.createType('CurrencyId', currencyId);
    } else {
      cid = currencyId;
    }
    console.log(cid, 'currencyId');
    const token = Currency.tokenFrom(cid, amount);
    const cw = new Currency(
      {
        currencyId: cid,
        token,
      },
      api
    );

    return cw;
  }

  static fromToken(token: Token, apiRx: ApiRx): Currency {
    const symol = token.symbol;
    let cid: number;
    switch (symol) {
      case 'EDG':
        cid = 0;
        break;
      case 'WEBB':
        cid = 1;
        break;
      default:
        cid = 1;
    }
    // @ts-ignore
    const currencyId: CurrencyId = apiRx.createType('CurrencyId', cid);

    return new Currency(
      {
        currencyId,
        token,
      },
      apiRx
    );
  }

  public get token() {
    return this._inner.token;
  }

  public get symbol() {
    return this.token.symbol;
  }

  public get currencyId() {
    return this._inner.currencyId;
  }

  public get color() {
    const token = this.token.toString();
    return TOKEN_COLOR.get(token) || '#000000';
  }

  public get fullName() {
    const token = this.token.toString();
    return TOKEN_FULLNAMES.get(token) || '';
  }

  public get image() {
    const token = this.token.toString();
    return TOKEN_IMAGES.get(token);
  }
}
