import { useWebContext } from '@webb-dapp/react-environment';
import { Currency, CurrencyContent } from '@webb-dapp/react-environment/webb-context/currency/currency';
import { WrappingEventNames } from '@webb-dapp/react-environment/webb-context/wrap-unwrap';
import { useCallback, useEffect, useMemo, useState } from 'react';

export function useWrapUnwrap() {
  const { activeApi, activeChain } = useWebContext();

  // This state will control the UI options
  const [state, setState] = useState<{
    governedToken: CurrencyContent | null;
    wrappableToken: CurrencyContent | null;
    governedTokens: CurrencyContent[];
    wrappableTokens: CurrencyContent[];
    amount: number;
    context: 'wrap' | 'unwrap';
  }>({
    governedToken: null,
    wrappableToken: null,
    amount: 0,
    governedTokens: [],
    wrappableTokens: [],
    context: 'wrap',
  });
  const { amount, context } = state;

  const wrapUnwrapApi = useMemo(() => {
    const w = activeApi?.methods.wrapUnwrap?.core;
    console.log(w);
    if (w?.enabled) {
      return w.inner;
    }
    return null;
  }, [activeApi]);

  const initTokens = useCallback(() => {
    // Clear any previous state
    setState((p) => ({
      ...p,
      wrappableToken: null,
      governedToken: null,
    }));

    // first, grab all possible governed tokens
    wrapUnwrapApi?.getGovernedTokens().then((governedTokens) => {
      // then grab all the possible wrappable tokens
      wrapUnwrapApi.getWrappableTokens().then((wrappableTokens) => {
        // then, save them as options in the UI
        console.log('setState of wrappableTokens and governedTokens in hook');
        setState((p) => ({
          ...p,
          wrappableTokens: wrappableTokens.map((token) => Currency.fromCurrencyId(token)),
          governedTokens: governedTokens.map((token) => Currency.fromCurrencyId(token)),
        }));
      });
    });
  }, [wrapUnwrapApi]);

  const swap = useCallback(() => {
    setState((p) => ({
      ...p,
      context: p.context === 'unwrap' ? 'wrap' : 'unwrap',
    }));
  }, []);

  const setWrappableToken = (content: CurrencyContent | null) => {
    if (content?.view.id) {
      console.log('setWrappableToken in useWrapUnwrap called');
      wrapUnwrapApi?.setWrappableToken(content.view.id ?? null);
    }
  };

  const setGovernedToken = (content: CurrencyContent | null) => {
    if (content?.view.id) {
      console.log('setGovernedToken in useWrapUnwrap called');
      wrapUnwrapApi?.setGovernedToken(content.view.id);
    }
  };

  const execute = useCallback(() => {
    switch (context) {
      case 'wrap':
        return wrapUnwrapApi?.wrap({ amount });
      case 'unwrap':
        return wrapUnwrapApi?.unwrap({ amount });
    }
  }, [context, wrapUnwrapApi, amount]);

  const setAmount = (amount: number) => {
    setState((p) => ({ ...p, amount }));
  };

  useEffect(() => {
    console.log('useEffect for wrapUnwrapApi subscription');
    initTokens();
    const r = wrapUnwrapApi?.subscription.subscribe((next) => {
      const key = Object.keys(next)[0] as WrappingEventNames;
      switch (key) {
        case 'ready':
        case 'stateUpdate':
          initTokens();
          break;
        case 'wrappableTokenUpdate':
          setState((p) => ({
            ...p,
            wrappableToken: Currency.fromCurrencyId(next.wrappableTokenUpdate!),
          }));
          break;
        case 'governedTokenUpdate':
          setState((p) => ({
            ...p,
            governedToken: Currency.fromCurrencyId(next.governedTokenUpdate!),
          }));
          break;
      }
    });

    return () => r?.unsubscribe();
  }, [initTokens, wrapUnwrapApi]);

  return {
    ...state,
    execute,
    swap,
    setGovernedToken,
    setWrappableToken,
    setAmount,
  };
}
