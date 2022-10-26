import { Currency } from '@nepoche/abstract-api-provider';
import { useWebContext } from '@nepoche/api-provider-environment';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { useEffect, useState } from 'react';

export const useCurrencies = () => {
  const { activeApi, activeChain } = useWebContext();
  const [governedCurrencies, setGovernedCurrencies] = useState<Currency[]>([]);
  const [governedCurrency, setGovernedCurrency] = useState<Currency | null>(null);

  const [wrappableCurrencies, setWrappableCurrencies] = useState<Currency[]>([]);
  const [wrappableCurrency, setWrappableCurrencyState] = useState<Currency | null>(null);

  useEffect(() => {
    if (!activeApi || !activeChain) {
      return;
    }

    const activeBridgeSub = activeApi.state.$activeBridge.subscribe((bridge) => {
      setGovernedCurrencies(
        Object.values(activeApi.state.getBridgeOptions()).map((potentialBridge) => {
          return potentialBridge.currency;
        })
      );

      if (bridge?.currency) {
        setGovernedCurrency(bridge.currency);

        activeApi.methods.bridgeApi
          .fetchWrappableAssets(calculateTypedChainId(activeChain.chainType, activeChain.chainId))
          .then((assets) => {
            setWrappableCurrencies(assets);
          })
          .catch((error) => {
            console.log('error: ', error);
          });
      }
    });

    const wrappableCurrencySub = activeApi.state.$wrappableCurrency.subscribe((token) => {
      setWrappableCurrencyState(token);
    });

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
