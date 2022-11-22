import { Currency } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { useCallback } from 'react';

export interface BridgeApi {
  setGovernedCurrency(currency: Currency): Promise<void>;
  setWrappableCurrency(currency: Currency | null): Promise<void>;
}

export const useBridge = (): BridgeApi => {
  const { activeApi } = useWebContext();

  const setWrappableCurrency = useCallback(
    async (currency: Currency | null) => {
      if (activeApi) {
        activeApi.state.wrappableCurrency = currency;
      }
    },
    [activeApi]
  );

  const setGovernedCurrency = useCallback(
    async (currency: Currency) => {
      if (!activeApi) {
        return;
      }

      activeApi.methods.bridgeApi.setBridgeByCurrency(currency);
    },
    [activeApi]
  );

  return {
    setWrappableCurrency,
    setGovernedCurrency,
  };
};
