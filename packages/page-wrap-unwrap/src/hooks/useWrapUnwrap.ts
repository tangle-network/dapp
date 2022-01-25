import { currenciesConfig, WebbCurrencyId } from '@webb-dapp/apps/configs';
import { WebbGovernedToken } from '@webb-dapp/contracts/contracts';
import { Bridge, useWebContext } from '@webb-dapp/react-environment';
import { CurrencyType } from '@webb-dapp/react-environment/types/currency-config.interface';
import { Currency, CurrencyContent } from '@webb-dapp/react-environment/webb-context/currency/currency';
import { WrappingEventNames } from '@webb-dapp/react-environment/webb-context/wrap-unwrap';
import { useCallback, useEffect, useMemo, useState } from 'react';

export function useWrapUnwrap() {
  const { activeApi } = useWebContext();

  const [state, setState] = useState<{
    tokens: CurrencyContent[];
    wrappedTokens: CurrencyContent[];
    rightHandToken: CurrencyContent | null;
    leftHandToken: CurrencyContent | null;
    amount: number;
    context: 'wrap' | 'unwrap';
  }>({
    leftHandToken: null,
    rightHandToken: null,
    amount: 0,
    tokens: [],
    wrappedTokens: [],
    context: 'wrap',
  });
  const { amount, context, leftHandToken, rightHandToken } = state;

  const wrapUnwrapApi = useMemo(() => {
    const w = activeApi?.methods.wrapUnwrap?.core;
    console.log(w);
    if (w?.enabled) {
      return w.inner;
    }
    return null;
  }, [activeApi]);

  const initWrappableTokens = useCallback(() => {
    wrapUnwrapApi?.getWrappableTokens(wrapUnwrapApi.currentToken).then((tokens) => {
      setState((p) => ({
        ...p,
        tokens: tokens.map((token) => Currency.fromCurrencyId(token)),
      }));
    });
  }, [wrapUnwrapApi]);

  const initGovernedToken = useCallback(() => {
    wrapUnwrapApi?.getGovernedTokens().then((tokens) => {
      setState((p) => ({
        ...p,
        wrappedTokens: tokens.map((token) => Currency.fromCurrencyId(token)),
      }));
    });
  }, [wrapUnwrapApi]);

  const init = useCallback(() => {
    initWrappableTokens();
    initGovernedToken();
  }, [initWrappableTokens, initGovernedToken]);

  useEffect(() => {
    init();
    const sub = wrapUnwrapApi?.$currentTokenValue.subscribe(async (val) => {
      console.log(`current token value`, val);
    });
    return () => sub?.unsubscribe();
  }, [wrapUnwrapApi, init]);

  useEffect(() => {
    console.log('useEffect for wrapUnwrapApi subscription');
    const r = wrapUnwrapApi?.subscription.subscribe((next) => {
      const key = Object.keys(next)[0] as WrappingEventNames;
      switch (key) {
        case 'ready':
        case 'stateUpdate':
          init();
          break;
        case 'wrappedTokens':
          break;
        case 'nativeTokensUpdate':
          break;
        case 'governedTokensUpdate':
          break;
      }
    });

    return () => r?.unsubscribe();
  }, [init, wrapUnwrapApi]);

  const swap = useCallback(() => {
    setState((p) => ({
      ...p,
      leftHandToken: rightHandToken,
      rightHandToken: leftHandToken,
      context: p.context === 'unwrap' ? 'wrap' : 'unwrap',
    }));
  }, [rightHandToken, leftHandToken]);

  const setRightHandToken = (content: CurrencyContent | undefined) => {
    setState((p) => ({
      ...p,
      rightHandToken: content || null,
    }));
  };

  const setLeftHandToken = (content: CurrencyContent | undefined) => {
    setState((p) => ({
      ...p,
      leftHandToken: content || null,
    }));
  };

  useEffect(() => {
    if (context === 'wrap') {
      wrapUnwrapApi?.setCurrentToken(rightHandToken ? rightHandToken.view.id : null);
      wrapUnwrapApi?.setOtherEdgToken(leftHandToken ? leftHandToken.view.id : null);
    } else {
      wrapUnwrapApi?.setCurrentToken(leftHandToken ? leftHandToken.view.id : null);
      wrapUnwrapApi?.setOtherEdgToken(rightHandToken ? rightHandToken.view.id : null);
    }
  }, [leftHandToken, rightHandToken, context, wrapUnwrapApi]);

  const execute = useCallback(() => {
    switch (context) {
      case 'wrap':
        return wrapUnwrapApi?.wrap({ amount });
      case 'unwrap':
        return wrapUnwrapApi?.unwrap({ amount });
    }
    return Promise.resolve('');
  }, [context, wrapUnwrapApi, amount]);

  const setAmount = (amount: number) => {
    setState((p) => ({ ...p, amount }));
  };

  return {
    ...state,
    execute,
    swap,
    setRightHandToken,
    setLeftHandToken,
    setAmount,
  };
}
