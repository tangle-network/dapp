import { chainsPopulated } from '@webb-dapp/apps/configs/wallets/chains-populated';
import { currenciesConfig } from '@webb-dapp/apps/configs/wallets/currency-config';
import { Chain } from '@webb-dapp/react-environment';
import { Token } from '@webb-tools/sdk-core';
import { createElement } from 'react';

export type WebbCurrencyId = number;

interface Data {
  currencyId: WebbCurrencyId;
  token: Token;
}

//TODO handle state from the provider
const chains = chainsPopulated;

export interface CurrencyView {
  id: number | string;
  icon: ReturnType<typeof createElement>;
  name: string;
  color?: string;
  symbol: string;
  chainName: string;
}

export interface CurrencyConfig extends Omit<CurrencyView, 'chainName'> {}

export class Currency {
  constructor(private data: CurrencyConfig) {}

  static fromCurrencyId(currencyId: WebbCurrencyId) {
    const currencyConfig = currenciesConfig[currencyId];
    return new Currency(currencyConfig);
  }

  get supportedChains(): Chain[] {
    return Object.values(chains).filter((chain) => {
      const currencyIndex = chain.currencies.findIndex((currency) => {
        return this.data.id == currency.currencyId;
      });
      return currencyIndex > -1;
    });
  }

  get view(): CurrencyView {
    const nativeCurrencyForChain = Object.values(chains).find((chain) => chain.nativeCurrencyId == this.data.id);
    return {
      chainName: nativeCurrencyForChain?.name ?? '',
      icon: this.data.icon,
      id: this.data.id,
      name: this.data.name,
      color: this.data.color,
      symbol: this.data.symbol,
    };
  }
}
