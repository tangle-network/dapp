import { Currency } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { useCallback, useState } from 'react';

export interface BridgeApi {
  setFungibleCurrency(currency: Currency | null): Promise<void>;

  setWrappableCurrency(currency: Currency | null): Promise<void>;
  wrappableCurrency: Currency | null;
  fungibleCurrency: Currency | null;
}

export const useBridge = (): BridgeApi => {
  const { activeApi } = useWebContext();
  const [fungibleCurrency] = useState<Currency | null>(null);
  const [wrappableCurrency] = useState<Currency | null>(null);

  const setWrappableCurrency = useCallback(
    async (_currency: Currency | null) => {
      // TODO: Remove this once we have a way to set the wrappable currency
    },
    [],
  );

  const setFungibleCurrency = useCallback(
    async (currency: Currency | null) => {
      if (!activeApi) {
        return;
      }

      activeApi.methods.bridgeApi.setBridgeByCurrency(currency);
    },
    [activeApi],
  );

  return {
    setWrappableCurrency,
    setFungibleCurrency,
    wrappableCurrency,
    fungibleCurrency,
  };
};
