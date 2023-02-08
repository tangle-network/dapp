import { Currency } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { useCallback, useEffect, useState } from 'react';
import { firstValueFrom } from 'rxjs';

export const useCurrencies = () => {
  const { activeApi, activeChain } = useWebContext();

  const [fungibleCurrencies, setFungibleCurrencies] = useState<Currency[]>([]);

  const [fungibleCurrency, setFungibleCurrencyState] =
    useState<Currency | null>(null);

  const [wrappableCurrencies, setWrappableCurrencies] = useState<Currency[]>(
    []
  );

  const [wrappableCurrency, setWrappableCurrencyState] =
    useState<Currency | null>(null);

  // FungibleCurrency -> wrappable Currency[]
  const [wrappableCurrenciesMap, setWrappableCurrenciesMap] = useState<
    Record<Currency['id'], Currency[]>
  >({});

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
  // then set the fungible currencies, wrappable currencies and current fungible currency
  useEffect(() => {
    if (!activeApi?.state?.activeBridge || !activeChain) {
      return;
    }

    const activeBridgeSub = activeApi.state.$activeBridge.subscribe(
      async (bridge) => {
        setFungibleCurrencies(
          Object.values(activeApi.state.getBridgeOptions()).map(
            (potentialBridge) => {
              return potentialBridge.currency;
            }
          )
        );

        const currentTypeChainId = calculateTypedChainId(
          activeChain.chainType,
          activeChain.chainId
        );

        const nativeCurrencyConfig =
          activeApi.config.currencies[activeChain.nativeCurrencyId];
        if (!nativeCurrencyConfig) {
          throw new Error(
            `Native currency ${activeChain.nativeCurrencyId} not found`
          );
        }

        const nativeCurrency = new Currency(nativeCurrencyConfig);

        if (!bridge?.currency) {
          return;
        }

        setFungibleCurrencyState(bridge.currency);

        try {
          const assets = await activeApi.methods.bridgeApi.fetchWrappableAssets(
            currentTypeChainId
          );
          setWrappableCurrencies(assets);

          const balance = await firstValueFrom(
            activeApi.methods.chainQuery.tokenBalanceByCurrencyId(
              currentTypeChainId,
              bridge.currency.id
            )
          );

          if (Number(balance) > 0 || !assets.length) {
            return;
          }

          // TODO: We should set the first wrappable currency which has balance
          // instead of the first one or native
          const foundAsset = assets.find((a) => a.id === nativeCurrency.id);
          if (foundAsset) {
            activeApi.state.wrappableCurrency = foundAsset;
          } else {
            activeApi.state.wrappableCurrency = assets[0];
          }
        } catch (error) {
          console.log('Error while fetching wrappable assets', error);
        }
      }
    );

    return () => {
      activeBridgeSub.unsubscribe();
    };
  }, [activeApi, activeChain]);

  // Side effect to subscribe to fungible currency and wrappable currency
  useEffect(() => {
    if (!activeApi?.state?.activeBridge) {
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
  }, [activeApi]);

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
