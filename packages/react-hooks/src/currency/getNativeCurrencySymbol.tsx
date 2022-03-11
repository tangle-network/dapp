import { useWebContext } from '@webb-dapp/react-environment/webb-context';
import { Currency } from '@webb-dapp/react-environment/webb-context/currency/currency';

export const getNativeCurrencySymbol = () => {
  const { activeChain } = useWebContext();
  if (!activeChain) return '';

  const currency = Currency.fromCurrencyId(activeChain.nativeCurrencyId);
  return currency.view.symbol;
};
