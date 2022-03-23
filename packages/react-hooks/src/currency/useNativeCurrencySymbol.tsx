import { Currency } from '@webb-dapp/mixer/utils/currency';
import { useWebContext } from '@webb-dapp/react-environment/webb-context';

export const useNativeCurrencySymbol = () => {
  const { activeChain } = useWebContext();
  if (!activeChain) return '';

  const currency = Currency.fromCurrencyId(activeChain.nativeCurrencyId);
  return currency.symbol;
};
