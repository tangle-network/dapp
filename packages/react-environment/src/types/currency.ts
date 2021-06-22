import { chainsConfig } from '@webb-dapp/apps/configs/wallets/chain-config';
import { currenciesConfig } from '@webb-dapp/apps/configs/wallets/currency-config';
import { walletsConfig } from '@webb-dapp/apps/configs/wallets/wallets-config';
import { Chain, Wallet } from '@webb-dapp/react-environment';
import { Token } from '@webb-tools/sdk-core';
import { createElement } from 'react';

export type WebbCurrencyId = number;

interface Data {
  currencyId: WebbCurrencyId;
  token: Token;
}
//TODO handle state from the provider
// TODO: move this once beresheet branch is merged to more usable way
const chains = Object.values(chainsConfig).reduce(
  (acc, chainsConfig) => ({
    ...acc,
    [chainsConfig.id]: {
      ...chainsConfig,
      wallets: Object.values(walletsConfig)
        .filter(({ supportedChainIds }) => supportedChainIds.includes(chainsConfig.id))
        .reduce(
          (acc, walletsConfig) => ({
            ...acc,
            [walletsConfig.id]: {
              ...walletsConfig,
            },
          }),
          {} as Record<number, Wallet>
        ),
    },
  }),
  {} as Record<number, Chain>
);

export interface CurrencyView {
  id: number | string;
  icon: ReturnType<typeof createElement> | JSX.Element;
  name: string;
  color?: string;
  symbol: string;
  chainName: string;
}

export interface CurrencyConfig extends Omit<CurrencyView, 'chainName'> {
  supportingChainsIds: number[];
}

export class Currency {
  constructor(private data: CurrencyConfig) {}

  static FromCurrencyId(currencyId: WebbCurrencyId) {
    const currencyConfig = currenciesConfig[currencyId];
    return new Currency(currencyConfig);
  }

  get supportedChains(): Chain[] {
    const supportedChains: Chain[] = [];
    this.data.supportingChainsIds.forEach((id) => {
      const chain = chains[id];
      if (chain) {
        supportedChains.push(chain);
      }
    });
    return supportedChains;
  }

  getView(activeChain: Chain): CurrencyView {
    return {
      chainName: activeChain.name,
      icon: this.data.icon,
      id: this.data.id,
      name: this.data.name,
      color: this.data.color,
      symbol: this.data.symbol,
    };
  }
}

/*export class Currency {
  private constructor(private _inner: Data, private _apiRx: ApiRx) {}

  static tokenFrom(currencyId: WebbCurrencyId | CurrencyId, amount: number) {
    // @ts-ignore
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

  static fromCurrencyId(currencyId: WebbCurrencyId | number, api: ApiRx, amount: number = 0): Currency {
    let cid: WebbCurrencyId;
    if (typeof currencyId === 'number') {
      // @ts-ignore
      cid = api.createType('CurrencyId', currencyId);
    } else {
      cid = currencyId;
    }
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
        currencyId: currencyId?.toNumber(),
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
}*/
