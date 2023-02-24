import {
  CurrencyRole,
  CurrencyType,
  zeroAddress,
} from '@webb-tools/dapp-types';
import { ChainType, parseTypedChainId } from '@webb-tools/sdk-core';
import { ethers } from 'ethers';

import { CurrencyConfig } from '../../currencies';
import { fetchEVMFungibleCurrency } from './fetchEVMFungibleCurrency';
import { fetchEVMNativeCurrency } from './fetchEVMNativeCurrency';
import { fetchEVMWrappableCurrencies } from './fetchEVMWrappableCurrencies';
import { IEVMCurrency } from './types';

type FetchEVMCurrenciesConfigReturnType = {
  currenciesConfig: Record<number, CurrencyConfig>;
  // fungible currency id -> typed chain id -> wrappable currency ids
  fungibleToWrappableMap: Map<number, Map<number, Set<number>>>;
};

/**
 * Get the currencies config from the anchor config (for evm only)
 * @param anchorConfig the anchor config to use (`typedChainId` -> `anchorAddress`)
 * @param providerFactory the provider factory function to get the provider for a given typed chain id
 */
export const fetchEVMCurrenciesConfig = async (
  anchorConfig: Record<number, string>,
  providerFactory: (typedChainId: number) => ethers.providers.Provider
): Promise<FetchEVMCurrenciesConfigReturnType> => {
  const currenciesConfig: Record<number, CurrencyConfig> = {};

  /**
   * The map of fungible currency to typed chain ids to wrappable currencies
   *
   * ```jsx
   *   {
   *     [currencyId: number]: {
   *       [typedChainId: number]: Set<number> // currency ids
   *     }
   *   }
   * ```
   */
  const fungibleToWrappableMap = new Map<number, Map<number, Set<number>>>();

  // Get all evm typed chain ids from the anchor config
  const evmTypedChainIds = Object.keys(anchorConfig).filter((typedChainId) => {
    const { chainType } = parseTypedChainId(+typedChainId);
    return chainType === ChainType.EVM;
  });

  if (evmTypedChainIds.length === 0) {
    return {
      currenciesConfig,
      fungibleToWrappableMap,
    };
  }

  // Fetch all native currencies
  const nativeCurrencies: Array<CurrencyConfig> = [];
  evmTypedChainIds.forEach(async (typedChainId) => {
    try {
      const nativeCurrency = await fetchEVMNativeCurrency(+typedChainId);
      if (!nativeCurrency) {
        return;
      }

      const existedCurrency = Object.values(currenciesConfig).find(
        (currency) =>
          currency.symbol === nativeCurrency.symbol &&
          currency.name === nativeCurrency.name
      );
      if (!existedCurrency) {
        const nextCurrencyId = Object.keys(currenciesConfig).length;
        currenciesConfig[nextCurrencyId] = {
          id: nextCurrencyId,
          type: CurrencyType.NATIVE,
          role: CurrencyRole.Wrappable,
          symbol: nativeCurrency.symbol,
          name: nativeCurrency.name,
          decimals: nativeCurrency.decimals,
          addresses: new Map([[+typedChainId, zeroAddress]]),
        };
        nativeCurrencies.push(currenciesConfig[nextCurrencyId]);
      } else {
        existedCurrency.addresses.set(+typedChainId, zeroAddress);
      }
    } catch (error) {
      console.error('Unable to retrieve native token information', error);
    }
  });

  // Fetch the fungible currency for each evm chain
  const evmFungibleCurrenciesResponse = await Promise.allSettled(
    evmTypedChainIds.map(async (typedChainId) => {
      const provider = providerFactory(+typedChainId);
      const fungibleCurrency = await fetchEVMFungibleCurrency(
        +typedChainId,
        provider
      );
      if (!fungibleCurrency) {
        return null;
      }

      const existingCurrency = Object.values(currenciesConfig).find(
        (currency) =>
          currency.symbol === fungibleCurrency.symbol &&
          currency.name === fungibleCurrency.name
      );

      if (!existingCurrency) {
        const nextCurrencyId = Object.keys(currenciesConfig).length;
        currenciesConfig[nextCurrencyId] = {
          id: nextCurrencyId,
          type: CurrencyType.ERC20,
          role: CurrencyRole.Governable,
          symbol: fungibleCurrency.symbol,
          name: fungibleCurrency.name,
          decimals: fungibleCurrency.decimals,
          addresses: new Map([[+typedChainId, fungibleCurrency.address]]),
        };
      } else {
        existingCurrency.addresses.set(+typedChainId, fungibleCurrency.address);
      }

      return {
        typedChainId: +typedChainId,
        currency: fungibleCurrency,
      };
    })
  );

  const evmFungibleCurrencies = evmFungibleCurrenciesResponse
    .map((response) => {
      if (response.status === 'fulfilled') {
        return response.value;
      }
    })
    .filter(
      (
        currency
      ): currency is { typedChainId: number; currency: IEVMCurrency } =>
        Boolean(currency)
    );

  // Fetch the wrappable currencies for each evm chain
  const fungibleWihtWrappableReponse = await Promise.allSettled(
    evmFungibleCurrencies.map(async ({ typedChainId, currency }) => {
      const fungibleCurrencyConfig = Object.values(currenciesConfig).find(
        (currencyConfig) =>
          currencyConfig.symbol === currency.symbol &&
          currencyConfig.name === currency.name
      );
      if (!fungibleCurrencyConfig) {
        console.error('Unable to find fungible currency config');
        return;
      }

      const provider = providerFactory(typedChainId);
      const { wrappableCurrencies, isNativeAllowed } =
        await fetchEVMWrappableCurrencies(currency, typedChainId, provider);

      // Iterate through the wrappable currencies and add them to the currencies config
      const wrappableCurrenciesConfigs = wrappableCurrencies.map(
        (wrappableCurrency) => {
          let existingCurrency = Object.values(currenciesConfig).find(
            (currency) =>
              currency.symbol === wrappableCurrency.symbol &&
              currency.name === wrappableCurrency.name
          );
          if (!existingCurrency) {
            const nextCurrencyId = Object.keys(currenciesConfig).length;
            existingCurrency = {
              id: nextCurrencyId,
              type: CurrencyType.ERC20,
              role: CurrencyRole.Wrappable,
              symbol: wrappableCurrency.symbol,
              name: wrappableCurrency.name,
              decimals: wrappableCurrency.decimals,
              addresses: new Map([[+typedChainId, wrappableCurrency.address]]),
            };
            currenciesConfig[nextCurrencyId] = existingCurrency;
          } else {
            existingCurrency.addresses.set(
              +typedChainId,
              wrappableCurrency.address
            );
          }

          return existingCurrency;
        }
      );

      return {
        typedChainId,
        fungibleCurrencyConfig,
        wrappableCurrenciesConfigs,
        isNativeAllowed,
      };
    })
  );

  const fungibleWithWrappable = fungibleWihtWrappableReponse
    .map((response) => {
      if (response.status === 'fulfilled') {
        return response.value;
      }
    })
    .filter(
      (
        currency
      ): currency is {
        typedChainId: number;
        fungibleCurrencyConfig: CurrencyConfig;
        wrappableCurrenciesConfigs: Array<CurrencyConfig>;
        isNativeAllowed: boolean;
      } => Boolean(currency)
    );

  // Create the fungible to wrappable map
  fungibleWithWrappable.forEach(
    ({
      fungibleCurrencyConfig,
      isNativeAllowed,
      typedChainId,
      wrappableCurrenciesConfigs,
    }) => {
      const fungibleCurrencyId = fungibleCurrencyConfig.id;
      const wrappableIds = new Set<number>();
      wrappableCurrenciesConfigs.forEach((wrappableCurrencyConfig) => {
        wrappableIds.add(wrappableCurrencyConfig.id);
      });

      if (isNativeAllowed) {
        const native = nativeCurrencies.find((nativeCurrencyConfig) => {
          const typedChainIds = Array.from(
            nativeCurrencyConfig.addresses.keys()
          );
          return typedChainIds.includes(typedChainId);
        });

        if (native) {
          wrappableIds.add(native.id);
        }
      }

      const fungibleMap = fungibleToWrappableMap.get(fungibleCurrencyId);
      if (fungibleMap) {
        fungibleMap.set(typedChainId, wrappableIds);
      } else {
        fungibleToWrappableMap.set(
          fungibleCurrencyId,
          new Map([[typedChainId, wrappableIds]])
        );
      }
    }
  );

  return { currenciesConfig, fungibleToWrappableMap };
};
