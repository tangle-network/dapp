import { Currency } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { CurrencyRole } from '@webb-tools/dapp-types';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import isEqual from 'lodash/isEqual';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const useCurrencies = () => {
  const { activeApi, loading, apiConfig, activeChain } = useWebContext();

  const [fungibleCurrency, setFungibleCurrencyState] =
    useState<Currency | null>(null);

  const [wrappableCurrency, setWrappableCurrencyState] =
    useState<Currency | null>(null);

  // Supported fungible currencies of the current chain
  const fungibleCurrencies = useMemo(() => {
    if (!activeChain) {
      return [];
    }

    const currentTypedChainId = calculateTypedChainId(
      activeChain.chainType,
      activeChain.id
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

  // All the fungible currencies
  const allFungibleCurrencies = useMemo<Currency[]>(() => {
    return apiConfig
      .getCurrenciesBy({ role: CurrencyRole.Governable })
      .map((c) => new Currency(c));
  }, [apiConfig]);

  // Record where fungible currency id -> wrappable currencies of the current chain
  const wrappableCurrenciesMap = useMemo(() => {
    if (!activeChain) {
      return {};
    }

    const typedChainId = calculateTypedChainId(
      activeChain.chainType,
      activeChain.id
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

  // Record where fungible currency id -> wrappable currencies
  const allWrappableCurrenciesMap = useMemo(() => {
    return Array.from(apiConfig.fungibleToWrappableMap.entries()).reduce(
      (prev, [fungibleId, typedChainIdWrappableMap]) => {
        const wrappableIdSet = Array.from(
          typedChainIdWrappableMap.values()
        ).reduce((acc, set) => {
          set.forEach((id) => acc.add(id));
          return acc;
        }, new Set<number>());

        prev[fungibleId] = Array.from(wrappableIdSet.values()).map(
          (id) => new Currency(apiConfig.currencies[id])
        );

        return prev;
      },
      {} as Record<number, Currency[]>
    );
  }, [apiConfig.currencies, apiConfig.fungibleToWrappableMap]);

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
    (currencyId: number, onlyCurrentChain = true) => {
      if (onlyCurrentChain) {
        return wrappableCurrenciesMap[currencyId] || [];
      }

      return allWrappableCurrenciesMap[currencyId] || [];
    },
    [allWrappableCurrenciesMap, wrappableCurrenciesMap]
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
      setFungibleCurrencyState((prevCurrency) => {
        if (!bridge) {
          return prevCurrency;
        }

        if (!prevCurrency) {
          return bridge.currency;
        }

        if (isEqual(prevCurrency, bridge.currency)) {
          return prevCurrency;
        }

        return bridge.currency;
      });
    });

    sub[1] = activeApi.state.$wrappableCurrency.subscribe((currency) => {
      setWrappableCurrencyState((prevCurrency) => {
        if (isEqual(prevCurrency, currency)) {
          return prevCurrency;
        }

        return currency;
      });
    });

    return () => {
      sub.forEach((s) => s.unsubscribe());
    };
  }, [activeApi, loading]);

  return {
    allFungibleCurrencies,
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
