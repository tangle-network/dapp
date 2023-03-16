import { Currency } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { CurrencyRole } from '@webb-tools/dapp-types';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const useCurrencies = () => {
  const { activeApi, loading, apiConfig, activeChain } = useWebContext();

  const [fungibleCurrency, setFungibleCurrencyState] =
    useState<Currency | null>(null);

  const [wrappableCurrency, setWrappableCurrencyState] =
    useState<Currency | null>(null);

  const fungibleCurrencies = useMemo(() => {
    if (!activeChain) {
      return [];
    }

    const currentTypedChainId = calculateTypedChainId(
      activeChain.chainType,
      activeChain.chainId
    );
    const currencies = apiConfig.currencies ?? [];

    return Object.values(currencies)
      .filter(
        (currencyConfig) =>
          currencyConfig.role === CurrencyRole.Governable &&
          Array.from(currencyConfig.addresses.keys()).includes(
            currentTypedChainId
          ) // filter out currencies that are not supported on the current chain
      )
      .map((currencyConfig) => new Currency(currencyConfig));
  }, [activeChain, apiConfig.currencies]);

  // Record where fungible currency id -> wrappable currencies
  const wrappableCurrenciesMap = useMemo(() => {
    if (!activeChain) {
      return {};
    }

    const typedChainId = calculateTypedChainId(
      activeChain.chainType,
      activeChain.chainId
    );

    return Array.from(apiConfig.fungibleToWrappableMap.entries()).reduce(
      (acc, [fungibleId, wrappableMap]) => {
        const wrappableSet = wrappableMap.get(typedChainId);
        if (wrappableSet) {
          acc[fungibleId] = Array.from(wrappableSet.values()).map(
            (id) => new Currency(apiConfig.currencies[id])
          );
        }

        return acc;
      },
      {} as Record<number, Currency[]> // fungible currency id -> wrappable currencies
    );
  }, [activeChain, apiConfig.fungibleToWrappableMap, apiConfig.currencies]);

  const wrappableCurrencies = useMemo(() => {
    if (!fungibleCurrency) {
      return [];
    }

    return wrappableCurrenciesMap[fungibleCurrency.id] || [];
  }, [fungibleCurrency, wrappableCurrenciesMap]);

  const getPossibleFungibleCurrencies = useCallback(
    (currencyId: number) => {
      const ids = Object.keys(wrappableCurrenciesMap).filter((key) =>
        wrappableCurrenciesMap[Number(key)].find((c) => c.id === currencyId)
      );
      return fungibleCurrencies.filter((c) => ids.includes(String(c.id)));
    },
    [wrappableCurrenciesMap, fungibleCurrencies]
  );

  /**
   * Function to get the wrappable currencies for a given gorvened currency
   */
  const getWrappableCurrencies = useCallback(
    (currencyId: number) => {
      return wrappableCurrenciesMap[currencyId] || [];
    },
    [wrappableCurrenciesMap]
  );

  const setWrappableCurrency = useCallback(
    async (currency: Currency | null) => {
      if (activeApi) {
        activeApi.state.wrappableCurrency = currency;
      }
    },
    [activeApi]
  );

  const setFungibleCurrency = useCallback(
    async (currency: Currency | null) => {
      if (!activeApi) {
        return;
      }

      activeApi.methods.bridgeApi.setBridgeByCurrency(currency);
    },
    [activeApi]
  );

  // Side effect to subscribe to fungible currency and wrappable currency
  useEffect(() => {
    if (!activeApi || loading) {
      return;
    }

    const sub: { unsubscribe(): void }[] = [];

    sub[0] = activeApi.state.$activeBridge.subscribe((bridge) => {
      setFungibleCurrencyState(bridge?.currency ?? null);
    });

    sub[1] = activeApi.state.$wrappableCurrency.subscribe((currency) => {
      setWrappableCurrencyState(currency);
    });

    return () => {
      sub.forEach((s) => s.unsubscribe());
    };
  }, [activeApi, loading]);

  return {
    fungibleCurrencies,
    fungibleCurrency,
    setFungibleCurrency,
    wrappableCurrencies,
    wrappableCurrency,
    setWrappableCurrency,
    getWrappableCurrencies,
    getPossibleFungibleCurrencies,
  };
};
