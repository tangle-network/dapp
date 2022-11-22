import { Currency } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { useEffect, useState } from 'react';

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
            (potentialBridge) => {
              return activeApi.methods.bridgeApi
                .fetchWrappableAssetsByBridge(typedChainId, potentialBridge)
                .then((currencies) => ({
                  currencies,
                  bridgeCurrency: potentialBridge.currency,
                }));
            }
          )
        );
        const nextWrappableCurrenciesMap = tokens.reduce(
          (map, entry) => ({ ...map, [entry.bridgeCurrency.id]: currencies }),
          {}
        );
        setWrappableCurrenciesMap(nextWrappableCurrenciesMap);
      };
      handler().catch((e) => {
        console.error(e);
      });
    }
  }, [activeChain, activeApi, setWrappableCurrenciesMap]);

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
              console.log('fetched assets dynamically', assets);
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
  };
};
