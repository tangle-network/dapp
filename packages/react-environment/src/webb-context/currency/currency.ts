import {
  chainsConfig,
  ChainTypeId,
  currenciesConfig,
  InternalChainId,
  internalChainIdToChainId,
  WebbCurrencyId,
} from '@webb-dapp/apps/configs';
import {
  CurrencyConfig,
  CurrencyRole,
  CurrencyView,
} from '@webb-dapp/react-environment/types/currency-config.interface';

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

  static isWrappableCurrency(currencyId: WebbCurrencyId) {
    if (currenciesConfig[currencyId].role == CurrencyRole.Wrappable) return true;
    return false;
  }

  getAddress(chain: InternalChainId): string | undefined {
    return this.data.addresses.get(chain);
  }

  hasChain(chain: InternalChainId): boolean {
    return this.data.addresses.has(chain);
  }

  getChainIds(): InternalChainId[] {
    return Array.from(this.data.addresses.keys());
  }

  getChainIdsAndTypes(): ChainTypeId[] {
    return Array.from(this.data.addresses.keys()).map((internalId) => {
      return { chainType: chainsConfig[internalId].chainType, chainId: chainsConfig[internalId].chainId };
    });
  }

  get view(): CurrencyView {
    return {
      icon: this.data.icon,
      id: this.data.id,
      type: this.data.type,
      name: this.data.name,
      color: this.data.color,
      symbol: this.data.symbol,
    };
  }
}
