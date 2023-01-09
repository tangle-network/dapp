import { Currency } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useCurrencyBalance } from './useCurrencyBalance';
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

  // Ref to auto select wrappable token if the selected governance token balance is 0
  // and no bridgeWrappableCurrency is selected and only check one time every render
  const autoSelectedWrappableTokenRef = useRef(false);

  const governedCurrencyBalance = useCurrencyBalance(governedCurrency);

  // Other supported tokens balances
  const balances = useCurrenciesBalances(wrappableCurrencies);

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

  // Side effect to update the selected token if the selected governance token balance
  // is 0 and no bridgeWrappableCurrency is selected
  useEffect(() => {
    const updateCurrnetToken = async () => {
      const isNeedAutoSelectWrappableToken =
        governedCurrency &&
        !wrappableCurrency &&
        governedCurrencyBalance === 0 &&
        !autoSelectedWrappableTokenRef.current;

      if (!isNeedAutoSelectWrappableToken) {
        return;
      }

      const foundWrappableCurrency = wrappableCurrencies.find(
        (currency) => balances[currency.id] > 0
      );
      if (!foundWrappableCurrency) {
        return;
      }

      autoSelectedWrappableTokenRef.current = true;
      const tokens = getPossibleGovernedCurrencies(foundWrappableCurrency.id);
      await setGovernedCurrency(tokens[0]);
      await setWrappableCurrency(foundWrappableCurrency);
    };

    updateCurrnetToken();

    return () => {
      autoSelectedWrappableTokenRef.current = false;
    };
  }, [
    balances,
    governedCurrency,
    wrappableCurrency,
    getPossibleGovernedCurrencies,
    setGovernedCurrency,
    setWrappableCurrency,
    wrappableCurrencies,
  ]);

  // Side effect to subscribe to the active api,
  // then set the governed currencies and wrapable currencies
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

    return () => sub.forEach((s) => s.unsubscribe());
  }, [activeApi, setWrappableCurrencyState, setGovernedCurrencyState]);

  return {
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
