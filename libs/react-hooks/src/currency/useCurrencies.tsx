import { Currency } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { useCallback, useEffect, useState } from 'react';

export const useCurrencies = () => {
  const { activeApi, activeChain } = useWebContext();
  const [governedCurrencies, setGovernedCurrencies] = useState<Currency[]>([]);

  const [governedCurrency, setGovernedCurrency] = useState<Currency | null>(
    null
  );

  const [wrappableCurrencies, setWrappableCurrencies] = useState<Currency[]>(
    []
  );
  const [wrappableCurrency, setWrappableCurrencyState] =
    useState<Currency | null>(null);

  // GovernableCurrency -> wrappableCurrency[]
  const [wrappableCurrenciesMap, setWrappableCurrenciesMap] = useState<
    Record<Currency['id'], Currency[]>
  >({});

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
  }, [activeChain, activeApi, setWrappableCurrenciesMap]);

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
          setGovernedCurrency(bridge.currency);

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

    const wrappableCurrencySub = activeApi.state.$wrappableCurrency.subscribe(
      (token) => {
        setWrappableCurrencyState(token);
      }
    );

    return () => {
      activeBridgeSub.unsubscribe();
      wrappableCurrencySub.unsubscribe();
    };
  }, [activeApi, activeChain]);

  return {
    governedCurrencies,
    governedCurrency,
    wrappableCurrencies,
    wrappableCurrency,
    getWrappableCurrencies,
    getPossibleGovernedCurrencies,
  };
};
