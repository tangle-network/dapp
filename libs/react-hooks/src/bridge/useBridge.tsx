import { Currency } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { useCallback, useEffect, useState } from 'react';

export interface BridgeApi {
  setGovernedCurrency(currency: Currency | null): Promise<void>;

  setWrappableCurrency(currency: Currency | null): Promise<void>;
  wrappableCurrency: Currency | null;
  governedCurrency: Currency | null;
}

export const useBridge = (): BridgeApi => {
  const { activeApi } = useWebContext();
  const [governedCurrency, setGovernedCurrencyState] =
    useState<Currency | null>(activeApi?.state.activeBridge.currency ?? null);
  const [wrappableCurrency, setWrapableCurrencyState] =
    useState<Currency | null>(activeApi?.state.wrappableCurrency ?? null);

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
  useEffect(() => {
    if (activeApi) {
      activeApi.state.$activeBridge.subscribe((bridge) =>
        setWrapableCurrencyState(bridge?.currency)
      );
      activeApi.state.$wrappableCurrency.subscribe((currency) => {
        setWrapableCurrencyState(currency);
      });
    }
  }, [activeApi, setWrapableCurrencyState, setGovernedCurrencyState]);

  return {
    setWrappableCurrency,
    setGovernedCurrency,
    wrappableCurrency,
    governedCurrency,
  };
};
