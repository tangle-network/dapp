import { Currency } from '@webb-dapp/api-providers/abstracts/currency';
import { useWebContext } from '@webb-dapp/react-environment';
import { useCurrencies } from '@webb-dapp/react-hooks/currency';
import { useCurrencyBalance } from '@webb-dapp/react-hooks/currency/useCurrencyBalance';
import { LoggerService } from '@webb-tools/app-util';
import { useCallback, useMemo, useState } from 'react';

const logger = LoggerService.get('useWrapUnwrap');

// 'Governed' tokens represent a token which can be minted from a deposit
//    of various 'wrappable' tokens. Governed tokens are the tokens which are bridged
//    in the webb system.
// 'Wrappable' tokens represent tokens which can be deposited into a wrapper
//    contract - which will mint an appropriate amount of 'governed' token.

export function useWrapUnwrap() {
  const { activeApi } = useWebContext();
  const { governedCurrencies, governedCurrency, wrappableCurrencies, wrappableCurrency } = useCurrencies();

  const governedCurrencyBalance = useCurrencyBalance(governedCurrency);
  const wrappableCurrencyBalance = useCurrencyBalance(wrappableCurrency);

  // Track the user input for use of wrap or unwrap
  const [context, setContext] = useState<'wrap' | 'unwrap'>('wrap');
  // Track the user input for desired amount to wrap/unwrap
  const [amount, setAmount] = useState<number | null>(null);

  const setWrappableCurrency = (currency: Currency | null) => {
    if (activeApi) {
      activeApi.state.wrappableCurrency = currency;
    }
  };

  const setGovernedCurrency = useCallback(
    (currency: Currency): void => {
      if (!activeApi || !activeApi.state.activeBridge) {
        return;
      }

      activeApi.methods.bridgeApi.setBridgeByCurrency(currency);
    },
    [activeApi]
  );

  const wrapUnwrapApi = useMemo(() => {
    const w = activeApi?.methods.wrapUnwrap?.core;
    logger.log(w);
    if (w?.enabled) {
      return w.inner;
    }
    return null;
  }, [activeApi]);

  const swap = useCallback(() => {
    context === 'wrap' ? setContext('unwrap') : setContext('wrap');
  }, [context]);

  const execute = useCallback(() => {
    if (!amount) {
      return;
    }

    switch (context) {
      case 'wrap':
        return wrapUnwrapApi?.wrap({ amount });
      case 'unwrap':
        return wrapUnwrapApi?.unwrap({ amount });
    }
  }, [context, wrapUnwrapApi, amount]);

  return {
    amount,
    context,
    governedCurrency,
    governedCurrencies,
    governedCurrencyBalance,
    wrappableCurrency,
    wrappableCurrencies,
    wrappableCurrencyBalance,
    execute,
    swap,
    setWrappableCurrency,
    setGovernedCurrency,
    setAmount,
  };
}
