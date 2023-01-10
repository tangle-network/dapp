import { Currency } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCurrenciesBalances } from './useCurrenciesBalances';

export const useCurrencies = () => {
  const { activeApi, activeChain } = useWebContext();

  const [governedCurrencies, setGovernedCurrencies] = useState<Currency[]>([]);

  const [governedCurrency, setGovernedCurrencyState] =
    useState<Currency | null>(null);

  const [wrappableCurrencies, setWrappableCurrencies] = useState<Currency[]>(
    []
  );

  const [wrappableCurrency, setWrappableCurrencyState] =
    useState<Currency | null>(null);

  // GovernableCurrency -> wrappableCurrency[]
  const [wrappableCurrenciesMap, setWrappableCurrenciesMap] = useState<
    Record<Currency['id'], Currency[]>
  >({});

  const allTokens = useMemo(
    () => governedCurrencies.concat(wrappableCurrencies),
    [governedCurrencies, wrappableCurrencies]
  );

  const balances = useCurrenciesBalances(allTokens);

  const getPossibleGovernedCurrencies = useCallback(
    (currencyId: number) => {
      const ids = Object.keys(wrappableCurrenciesMap).filter((key) =>
        wrappableCurrenciesMap[Number(key)].find((c) => c.id === currencyId)
      );
      return governedCurrencies.filter((c) => ids.includes(String(c.id)));
    },
    [wrappableCurrenciesMap, governedCurrencies]
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

  const setGovernedCurrency = useCallback(
    async (currency: Currency | null) => {
      if (!activeApi) {
        return;
      }

      activeApi.methods.bridgeApi.setBridgeByCurrency(currency);
    },
    [activeApi]
  );

  // Side effect to subscribe to the active chain and fetch the wrappable currencies
  // then update the wrappableCurrenciesMap
  useEffect(() => {
    if (activeApi && activeChain) {
      const typedChainId = calculateTypedChainId(
        activeChain.chainType,
        activeChain.chainId
      );

      const handler = async () => {
        const tokens = await Promise.all(
          Object.values(activeApi.state.getBridgeOptions()).map(
            async (potentialBridge) => {
              const currencies =
                await activeApi.methods.bridgeApi.fetchWrappableAssetsByBridge(
                  typedChainId,
                  potentialBridge
                );
              return {
                currencies,
                bridgeCurrency: potentialBridge.currency,
              };
            }
          )
        );
        const nextWrappableCurrenciesMap = tokens.reduce(
          (map, entry) => ({
            ...map,
            [entry.bridgeCurrency.id]: entry.currencies,
          }),
          {} as Record<Currency['id'], Currency[]>
        );
        setWrappableCurrenciesMap(nextWrappableCurrenciesMap);
      };

      handler().catch((e) => {
        console.log('Error fetching wrappable currencies');
        console.error(e);
      });
    }
  }, [activeChain, activeApi]);

  // Side effect to subscribe to the active api,
  // then set the governed currencies, wrappable currencies and current governed currency
  useEffect(() => {
    if (!activeApi || !activeChain) {
      return;
    }

    const activeBridgeSub = activeApi.state.$activeBridge.subscribe(
      (bridge) => {
        setGovernedCurrencies(
          Object.values(activeApi.state.getBridgeOptions()).map(
            (potentialBridge) => {
              return potentialBridge.currency;
            }
          )
        );

        if (bridge?.currency) {
          setGovernedCurrencyState(bridge.currency);

          activeApi.methods.bridgeApi
            .fetchWrappableAssets(
              calculateTypedChainId(activeChain.chainType, activeChain.chainId)
            )
            .then((assets) => {
              setWrappableCurrencies(assets);
            })
            .catch((error) => {
              console.log('error: ', error);
            });
        }
      }
    );

    return () => {
      activeBridgeSub.unsubscribe();
      setGovernedCurrencies([]);
      setWrappableCurrencies([]);
      setGovernedCurrencyState(null);
    };
  }, [activeApi, activeChain]);

  // Side effect to subscribe to governed currency and wrappable currency
  useEffect(() => {
    if (!activeApi) {
      return;
    }

    const sub: { unsubscribe(): void }[] = [];

    sub[0] = activeApi.state.$activeBridge.subscribe((bridge) => {
      setGovernedCurrencyState(bridge?.currency ?? null);
    });

    sub[1] = activeApi.state.$wrappableCurrency.subscribe((currency) => {
      setWrappableCurrencyState(currency);
    });

    return () => {
      sub.forEach((s) => s.unsubscribe());
      setGovernedCurrencyState(null);
      setWrappableCurrencyState(null);
    };
  }, [activeApi]);

  return {
    balances,
    governedCurrencies,
    governedCurrency,
    setGovernedCurrency,
    wrappableCurrencies,
    wrappableCurrency,
    setWrappableCurrency,
    getWrappableCurrencies,
    getPossibleGovernedCurrencies,
  };
};
