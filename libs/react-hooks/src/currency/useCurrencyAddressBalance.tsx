import { useWebContext } from '@webb-tools/api-provider-environment';
import { useMemo } from 'react';
import { Currency } from '@webb-tools/abstract-api-provider';
import { useCurrencyBalance } from '@webb-tools/react-hooks';

export function useCurrencyAddressBalance(address: string) {
  const { apiConfig } = useWebContext();
  const currency = useMemo(() => {
    const currencyConfig = apiConfig.getCurrencyByAddress(address);
    if (!currencyConfig) {
      return undefined;
    }
    return new Currency(currencyConfig);
  }, [apiConfig, address]);
  const balance = useCurrencyBalance(currency);
  return balance ?? '0';
}
