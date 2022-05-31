import { Currency } from '@webb-dapp/api-providers';
import { useWebContext } from '@webb-dapp/react-environment/webb-context';

export const useNativeCurrencySymbol = () => {
  const { activeChain, appConfig } = useWebContext();
  if (!activeChain) {
    return '';
  }

  const currency = Currency.fromCurrencyId(appConfig.currencies, activeChain.nativeCurrencyId);
  return currency.view.symbol;
};
