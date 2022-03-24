import { useWebContext } from '@webb-dapp/react-environment/webb-context';
import { Currency } from '@webb-tools/api-providers';

export const useNativeCurrencySymbol = () => {
  const { activeChain, appConfig } = useWebContext();
  if (!activeChain) return '';

  const currency = Currency.fromCurrencyId(appConfig.currencies, activeChain.nativeCurrencyId);
  return currency.view.symbol;
};
