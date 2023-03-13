import { ApiPromise } from '@polkadot/api';

import { CurrencyConfig } from '../../currencies';
import { ICurrency, OnChainConfigBase } from '../on-chain-config-base';

// the singleton instance of the EVM on-chain config with lazy initialization
let SubstrateOnChainConfigInstance: SubstrateOnChainConfig;

export class SubstrateOnChainConfig extends OnChainConfigBase {
  private constructor() {
    super();
  }

  static getInstance() {
    if (!SubstrateOnChainConfigInstance) {
      SubstrateOnChainConfigInstance = new SubstrateOnChainConfig();
    }
    return SubstrateOnChainConfigInstance;
  }

  async fetchNativeCurrency(typedChainId: number): Promise<ICurrency | null> {
    return null;
  }

  async fetchFungibleCurrency(
    typedChainId: number,
    provider: ApiPromise
  ): Promise<ICurrency | null> {
    return null;
  }

  async fetchWrappableCurrencies(
    fungibleCurrency: ICurrency,
    typedChainId: number,
    provider: ApiPromise
  ): Promise<ICurrency[]> {
    return [] as ICurrency[];
  }

  async fetchCurrenciesConfig(
    anchorConfig: Record<number, string>,
    providerFactory: (typedChainId: number) => ApiPromise,
    existedCurreniciesConfig: Record<number, CurrencyConfig> = {},
    // prettier-ignore
    existedFungibleToWrappableMap: Map<number, Map<number, Set<number>>> = new Map()
  ): Promise<{
    currenciesConfig: Record<number, CurrencyConfig>;
    fungibleToWrappableMap: Map<number, Map<number, Set<number>>>;
  }> {
    return {
      currenciesConfig: existedCurreniciesConfig,
      fungibleToWrappableMap: existedFungibleToWrappableMap,
    };
  }
}
