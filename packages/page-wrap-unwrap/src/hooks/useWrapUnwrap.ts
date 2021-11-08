import { BridgeCurrency, useWebContext } from '@webb-dapp/react-environment';
import { Currency, CurrencyContent } from '@webb-dapp/react-environment/types/currency';
import { fromBridgeCurrencyToCurrencyView } from '@webb-dapp/ui-components/Inputs/WalletBridgeCurrencyInput/WalletBridgeCurrencyInput';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { WrappingEventNames } from '@webb-dapp/react-environment/webb-context/wrap-unwrap';

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
  const { leftHandToken, rightHandToken, context } = state;

  const wrapUnwrapApi = useMemo(() => {
    const w = activeApi?.methods.wrapUnwrap?.core;
    console.log(w);
    if (w?.enabled) {
      return w.inner;
    }
    return null;
  }, [activeApi]);

  const initNativeTokens = useCallback(() => {
    wrapUnwrapApi?.getNativeTokens().then((tokens) => {
      setState((p) => ({
        ...p,
        tokens: tokens.map((token) => Currency.fromCurrencyId(Number(token.id))),
      }));
    });
  }, [wrapUnwrapApi]);

  const initGovernedToken = useCallback(() => {
    wrapUnwrapApi?.getGovernedTokens().then((tokens) => {
      setState((p) => ({
        ...p,
        wrappedTokens: tokens.map((token) => {
          const bridgeCurrency = BridgeCurrency.fromString(String(token.id));
          return fromBridgeCurrencyToCurrencyView(bridgeCurrency);
        }),
      }));
    });
  }, [wrapUnwrapApi]);

  const init = useCallback(() => {
    initNativeTokens();
    initGovernedToken();
  }, [initNativeTokens, initGovernedToken]);

  useEffect(() => {
    init();
    const sub = wrapUnwrapApi?.$currentTokenValue.subscribe((val) => {
      console.log(`current token value`, val);
    });
    return () => sub?.unsubscribe();
  }, [wrapUnwrapApi, init]);

  useEffect(() => {
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
  }, [rightHandToken, leftHandToken, wrapUnwrapApi]);

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
      const isNative = rightHandToken?.view.symbol.toLocaleLowerCase().indexOf('webb') === -1;
      wrapUnwrapApi?.setCurrentToken(
        rightHandToken ? { variant: isNative ? 'native-token' : 'governed-token', id: rightHandToken.view.id } : null
      );
    } else {
      const isNative = leftHandToken?.view.symbol.toLocaleLowerCase().indexOf('webb') === -1;
      wrapUnwrapApi?.setCurrentToken(
        leftHandToken ? { variant: isNative ? 'native-token' : 'governed-token', id: leftHandToken.view.id } : null
      );
    }
  }, [leftHandToken, rightHandToken, context]);
  console.log(wrapUnwrapApi?.currentToken);
  return {
    ...state,

    swap,

    setRightHandToken,
    setLeftHandToken,
  };
}
