import { ApiPromise } from '@polkadot/api';
import { CurrencyRole, CurrencyType } from '@webb-tools/dapp-types';
import { ChainType, parseTypedChainId } from '@webb-tools/sdk-core';
import assert from 'assert';
import { ethers } from 'ethers';
import { ChainAddressConfig } from '../anchors';

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

export interface CurrencyResponse {
  typedChainId: number;
  nativeCurrency: ICurrency;
  anchorAddressOrTreeId: string;
  fungibleCurrency: ICurrency;
  wrappableCurrencies: ICurrency[];
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
   * @param provider the provider to use (optional on evm but required on substrate)
   * @returns the native token info for the given chain id
   */
  abstract fetchNativeCurrency(
    typedChainId: number,
    provider?: ethers.providers.Provider | ApiPromise
  ): Promise<ICurrency | null>;

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
   * @param existedCurreniciesConfig the existed currencies config (`currencyId` -> `CurrencyConfig`)
   * @param existedFungibleToWrappableMap the existed map of fungible currency to typed chain ids to wrappable currencies
   * @param existedAnchorConfig the existed anchor config (`typedChainId` -> `ChainAddressConfig`)
   * @returns the currencies config and the map of fungible currency to typed chain ids to wrappable currencies
   */
  abstract fetchCurrenciesConfig(
    anchorConfig: Record<number, string[]>,
    providerFactory: (
      typedChainId: number
    ) => Promise<ethers.providers.Provider | ApiPromise>,
    existedCurreniciesConfig?: Record<number, CurrencyConfig>,
    existedFungibleToWrappableMap?: Map<number, Map<number, Set<number>>>,
    existedAnchorConfig?: Record<number, ChainAddressConfig>
  ): Promise<{
    currenciesConfig: Record<number, CurrencyConfig>;
    fungibleToWrappableMap: Map<number, Map<number, Set<number>>>;
    anchorConfig: Record<number, ChainAddressConfig>;
  }>;

  protected assertChainType(typedChainId: number, chainType: ChainType) {
    const { chainType: parsedChainType, chainId } =
      parseTypedChainId(typedChainId);
    assert(
      chainType === parsedChainType,
      `Invalid chain type for ${chainType}`
    );

    return {
      chainType,
      chainId,
    };
  }

  protected addCurrenciesIntoConfig(
    currenciesResponse: CurrencyResponse[],
    currenciesConfig: Record<number, CurrencyConfig>,
    fungibleToWrappableMap: Map<number, Map<number, Set<number>>>,
    anchorConfig: Record<string, ChainAddressConfig>
  ) {
    currenciesResponse.forEach(
      ({
        anchorAddressOrTreeId: anchorAddress,
        typedChainId,
        nativeCurrency,
        fungibleCurrency,
        wrappableCurrencies,
      }) => {
        // Add native currency
        const currentNative = Object.values(currenciesConfig).find(
          (currency) =>
            currency.name === nativeCurrency.name &&
            currency.symbol === nativeCurrency.symbol
        );

        const { address: nativeAddr, ...restNative } = nativeCurrency;

        if (!currentNative) {
          const nextId = Object.keys(currenciesConfig).length + 1;
          currenciesConfig[nextId] = {
            ...restNative,
            id: nextId,
            type: CurrencyType.NATIVE,
            role: CurrencyRole.Wrappable,
            addresses: new Map([[typedChainId, nativeAddr]]),
          };
        } else {
          if (
            currentNative.addresses.has(typedChainId) &&
            currentNative.addresses.get(typedChainId) !== nativeAddr
          ) {
            console.error(
              `Native currency ${currentNative.name} already exists on chain ${typedChainId}`
            );
          }

          currentNative.addresses.set(typedChainId, nativeAddr);
        }

        // Add fungible currency
        let currentFungible = Object.values(currenciesConfig).find(
          (currency) =>
            currency.name === fungibleCurrency.name &&
            currency.symbol === fungibleCurrency.symbol
        );

        const { address: fungbileAddr, ...restFungible } = fungibleCurrency;

        if (!currentFungible) {
          const nextId = Object.keys(currenciesConfig).length + 1;
          currentFungible = {
            ...restFungible,
            id: nextId,
            type: CurrencyType.ERC20,
            role: CurrencyRole.Governable,
            addresses: new Map([[typedChainId, fungbileAddr]]),
          };
          currenciesConfig[nextId] = currentFungible;
        } else {
          if (
            currentFungible.addresses.has(typedChainId) &&
            currentFungible.addresses.get(typedChainId) !== fungbileAddr
          ) {
            console.error(
              `Fungible currency ${currentFungible.name} already exists on chain ${typedChainId}`
            );
          }

          currentFungible.addresses.set(typedChainId, fungbileAddr);
        }

        // Add anchor
        const anchor = anchorConfig[currentFungible.id];
        if (!anchor) {
          anchorConfig[currentFungible.id] = {
            [typedChainId]: anchorAddress,
          };
        } else {
          if (anchor[typedChainId] && anchor[typedChainId] !== anchorAddress) {
            console.error(
              `Anchor for currency ${currentFungible.name} already exists on chain ${typedChainId}`,
              `Current: ${anchor[typedChainId]}, new one: ${anchorAddress}`
            );
          }

          anchor[typedChainId] = anchorAddress;
        }

        // Add wrappable currencies
        const wrappableCurrencyConfigs: CurrencyConfig[] = [];
        wrappableCurrencies.forEach(
          ({ address: wrappableAddr, ...restWrappable }) => {
            let currentWrappble = Object.values(currenciesConfig).find(
              (currency) =>
                currency.name === restWrappable.name &&
                currency.symbol === restWrappable.symbol
            );

            if (!currentWrappble) {
              const nextId = Object.keys(currenciesConfig).length + 1;
              currentWrappble = {
                ...restWrappable,
                id: nextId,
                type: CurrencyType.ERC20,
                role: CurrencyRole.Wrappable,
                addresses: new Map([[typedChainId, wrappableAddr]]),
              };
              currenciesConfig[nextId] = currentWrappble;
            } else {
              if (
                currentWrappble.addresses.has(typedChainId) &&
                currentWrappble.addresses.get(typedChainId) !== wrappableAddr
              ) {
                console.error(
                  `Wrappable currency ${currentWrappble.name} already exists on chain ${typedChainId}`
                );
              }

              currentWrappble.addresses.set(typedChainId, wrappableAddr);
            }

            wrappableCurrencyConfigs.push(currentWrappble);
          }
        );

        // Add fungible to wrappable map
        const wrappableIds = new Set(wrappableCurrencyConfigs.map((c) => c.id));
        const wrappableMap = fungibleToWrappableMap.get(currentFungible.id);
        if (!wrappableMap) {
          fungibleToWrappableMap.set(
            currentFungible.id,
            new Map([[typedChainId, wrappableIds]])
          );
        } else {
          wrappableMap.set(typedChainId, wrappableIds);
        }
      }
    );

    return {
      anchorConfig,
      currenciesConfig,
      fungibleToWrappableMap,
    };
  }
}
