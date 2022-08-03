import { Currency } from '@webb-dapp/api-providers';
import { useWebContext } from '@webb-dapp/react-environment/webb-context';

export const useNativeCurrencySymbol = () => {
  const { activeApi, activeChain, appConfig } = useWebContext();
  if (!activeChain || !activeApi) {
    return '';
  }

  const currency = new Currency(appConfig.currencies[activeChain.nativeCurrencyId]);
  return currency.view.symbol;
};
