import { ChainId, chainsPopulated, currenciesConfig, WebbCurrencyId } from '@webb-dapp/apps/configs';
import { Chain } from '@webb-dapp/react-environment';
import { createElement } from 'react';

//TODO handle state from the provider
const chains = chainsPopulated;

export interface CurrencyView {
  id: WebbCurrencyId | string;
  icon: ReturnType<typeof createElement>;
  name: string;
  color?: string;
  symbol: string;
}

export interface CurrencyConfig extends CurrencyView {
  addresses: Map<ChainId, string>;
}

export abstract class CurrencyContent {
  abstract get view(): CurrencyView;
}

// This currency class assumes that instances are wrappable assets.
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
      if (chain.currencies.includes(this.data.id as WebbCurrencyId)) {
        return true;
      }
      return false;
    });
  }

  getAddress(chain: ChainId): string | undefined {
    return this.data.addresses.get(chain);
  }

  get view(): CurrencyView {
    return {
      icon: this.data.icon,
      id: this.data.id,
      name: this.data.name,
      color: this.data.color,
      symbol: this.data.symbol,
    };
  }
}
