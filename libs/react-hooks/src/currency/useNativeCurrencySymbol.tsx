import { Currency } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';

export const useNativeCurrencySymbol = () => {
  const { activeApi, activeChain, apiConfig } = useWebContext();
  if (!activeChain || !activeApi) {
    return '';
  }

  const currency = new Currency(
    apiConfig.currencies[activeChain.nativeCurrencyId]
  );
  return currency.view.symbol;
};
