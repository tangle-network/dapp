import { ApiPromise } from '@polkadot/api';
import { ethers } from 'ethers';

import { CurrencyConfig } from '../currencies';

/**
 * The currency interface for the on-chain currencies
 */
export interface ICurrency {
  decimals: number;
  symbol: string;
  name: string;
  address: string;
}

export abstract class OnChainConfigBase {
  // Cache the native currencies to avoid finding the chain data multiple times
  // typedChainId -> nativeCurrency
  protected nativeCurrencyCache = new Map<number, ICurrency>();

  // Cache the fungible currencies
  // typedChainId -> fungibleCurrency | Error
  protected fungibleCurrencyCache = new Map<number, ICurrency | Error>();

  // Cache the wrappable currencies
  // typedChainId -> wrappableCurrencies | Error
  protected wrappableCurrenciesCache = new Map<number, ICurrency[] | Error>();

  /**
   * The constructor is protected to prevent the class from being instantiated
   */
  protected constructor() {
    // empty
  }

  /**
   * Retrieves the native token info for the given chain id
   * @param typedChainId the typed chain id to get the native token info for
   * @returns the native token info for the given chain id
   */
  abstract fetchNativeCurrency(typedChainId: number): Promise<ICurrency | null>;

  /**
   * Get the fungible currency config for a given typed chain id,
   * this function depends on the hardcoded anchor config
   * @param typedChainId the typed chain id to get the fungible currnecy
   */
  abstract fetchFungibleCurrency(
    typedChainId: number,
    anchorAddress: string,
    provider: ethers.providers.Provider | ApiPromise
  ): Promise<ICurrency | null>;

  /**
   * Either the list of currencies that can be wrapped to the given fungible currency
   * or the object contains the list of currencies and a flag to indicate if the native currency is allowed
   * @param fungbileCurrency the fungible currency to get the wrappable currencies
   * @param provider the provider to use
   * @returns the list of currencies that can be wrapped to the given fungible currency
   */
  abstract fetchWrappableCurrencies(
    fungibleCurrency: ICurrency,
    typedChainId: number,
    provider: ethers.providers.Provider | ApiPromise
  ): Promise<ICurrency[]>;

  /**
   * Get the currencies config and the map of fungible currency to typed chain ids to wrappable currencies
   * @param anchorConfig the anchor config to use (`typedChainId` -> `anchorAddress`)
   * @param providerFactory the provider factory function to get the provider for a given typed chain id
   * @returns the currencies config and the map of fungible currency to typed chain ids to wrappable currencies
   */
  abstract fetchCurrenciesConfig(
    anchorConfig: Record<number, string[]>,
    providerFactory: (
      typedChainId: number
    ) => ethers.providers.Provider | ApiPromise,
    existedCurreniciesConfig?: Record<number, CurrencyConfig>,
    existedFungibleToWrappableMap?: Map<number, Map<number, Set<number>>>
  ): Promise<{
    currenciesConfig: Record<number, CurrencyConfig>;
    fungibleToWrappableMap: Map<number, Map<number, Set<number>>>;
  }>;
}
