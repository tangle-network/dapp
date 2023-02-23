import { ERC20 } from '@webb-tools/contracts';
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

/**
 * Get the currencies config from the anchor config (for evm only)
 * @param anchorConfig the anchor config to use (`typedChainId` -> `anchorAddress`)
 * @param providerFactory the provider factory function to get the provider for a given typed chain id
 */
export const fetchEVMCurrenciesConfig = async (
  anchorConfig: Record<number, string>,
  providerFactory: (typedChainId: number) => ethers.providers.Provider
): Promise<Record<number, CurrencyConfig>> => {
  const currenciesConfig: Record<number, CurrencyConfig> = {};

  // Get all evm typed chain ids from the anchor config
  const evmTypedChainIds = Object.keys(anchorConfig).filter((typedChainId) => {
    const { chainType } = parseTypedChainId(+typedChainId);
    return chainType === ChainType.EVM;
  });

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
      } else {
        existedCurrency.addresses.set(+typedChainId, zeroAddress);
      }
    } catch (error) {
      console.log('Unable to retrieve native token information', error);
    }
  });

  if (evmTypedChainIds.length === 0) {
    return currenciesConfig;
  }

  // Get the fungible currency for each evm chain
  const evmFungibleCurrenciesResponse = await Promise.allSettled(
    evmTypedChainIds.map(async (typedChainId) => {
      const provider = providerFactory(+typedChainId);
      const currency = await fetchEVMFungibleCurrency(+typedChainId, provider);
      if (!currency) {
        return null;
      }
      const [name, symbol, decimals] = await Promise.all([
        currency.name(),
        currency.symbol(),
        currency.decimals(),
      ]);

      const existingCurrency = Object.values(currenciesConfig).find(
        (currency) => currency.symbol === symbol && currency.name === name
      );

      if (!existingCurrency) {
        const nextCurrencyId = Object.keys(currenciesConfig).length;
        currenciesConfig[nextCurrencyId] = {
          id: nextCurrencyId,
          type: CurrencyType.ERC20,
          role: CurrencyRole.Governable,
          symbol,
          name,
          decimals,
          addresses: new Map([[+typedChainId, currency.address]]),
        };
      } else {
        existingCurrency.addresses.set(+typedChainId, currency.address);
      }

      return {
        typedChainId: +typedChainId,
        currency,
      };
    })
  );

  const evmFungibleCurrencies = evmFungibleCurrenciesResponse
    .map((response) => {
      if (response.status === 'fulfilled') {
        return response.value;
      }
    })
    .filter((currency): currency is { typedChainId: number; currency: ERC20 } =>
      Boolean(currency)
    );

  // Get the wrappable currencies for each evm chain
  await Promise.allSettled(
    evmFungibleCurrencies.map(async ({ typedChainId, currency }) => {
      const provider = providerFactory(typedChainId);
      const wrappableCurrencies = await fetchEVMWrappableCurrencies(
        currency,
        +typedChainId,
        provider
      );

      await Promise.allSettled(
        wrappableCurrencies.map(async (wrappableCurrency) => {
          const [name, symbol, decimals] = await Promise.all([
            wrappableCurrency.name(),
            wrappableCurrency.symbol(),
            wrappableCurrency.decimals(),
          ]);

          const existingCurrency = Object.values(currenciesConfig).find(
            (currency) => currency.symbol === symbol && currency.name === name
          );
          if (!existingCurrency) {
            const nextCurrencyId = Object.keys(currenciesConfig).length;
            currenciesConfig[nextCurrencyId] = {
              id: nextCurrencyId,
              type: CurrencyType.ERC20,
              role: CurrencyRole.Wrappable,
              symbol,
              name,
              decimals,
              addresses: new Map([[+typedChainId, wrappableCurrency.address]]),
            };
          } else {
            existingCurrency.addresses.set(
              +typedChainId,
              wrappableCurrency.address
            );
          }
        })
      );
    })
  );

  return currenciesConfig;
};
