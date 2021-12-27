import { chainsPopulated, currenciesConfig, WebbCurrencyId } from '@webb-dapp/apps/configs';
import { Chain } from '@webb-dapp/react-environment';
import { createElement } from 'react';

//TODO handle state from the provider
const chains = chainsPopulated;

export interface CurrencyView {
  id: WebbCurrencyId;
  icon: ReturnType<typeof createElement>;
  name: string;
  color?: string;
  symbol: string;
  chainName: string;
}

export interface CurrencyConfig extends Omit<CurrencyView, 'chainName'> {}

export abstract class CurrencyContent {
  abstract get view(): CurrencyView;
}

export class Currency extends CurrencyContent {
  constructor(private data: CurrencyConfig) {
    super();
  }

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
