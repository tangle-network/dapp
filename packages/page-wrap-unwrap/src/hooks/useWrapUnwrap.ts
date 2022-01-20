import { BridgeCurrency } from '@webb-dapp/apps/configs';
import { useWebContext } from '@webb-dapp/react-environment';
import { Currency, CurrencyContent } from '@webb-dapp/react-environment/webb-context/currency/currency';
import { WrappingEventNames, WrappingTokenId } from '@webb-dapp/react-environment/webb-context/wrap-unwrap';
import { fromBridgeCurrencyToCurrencyView } from '@webb-dapp/ui-components/Inputs/WalletBridgeCurrencyInput/WalletBridgeCurrencyInput';
import { useCallback, useEffect, useMemo, useState } from 'react';

const currencyContentToWrappingToken = (currentContent: CurrencyContent): WrappingTokenId => {
  const isNative = currentContent?.view.symbol.toLocaleLowerCase().indexOf('webb') === -1;

  return { variant: isNative ? 'native-token' : 'governed-token', id: currentContent.view.id };
};

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

  const initNativeTokens = useCallback(() => {
    wrapUnwrapApi?.getWrappableTokens().then((tokens) => {
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
      wrapUnwrapApi?.setCurrentToken(rightHandToken ? currencyContentToWrappingToken(rightHandToken) : null);
      wrapUnwrapApi?.setOtherEdgToken(leftHandToken ? currencyContentToWrappingToken(leftHandToken) : null);
    } else {
      wrapUnwrapApi?.setCurrentToken(leftHandToken ? currencyContentToWrappingToken(leftHandToken) : null);
      wrapUnwrapApi?.setOtherEdgToken(rightHandToken ? currencyContentToWrappingToken(rightHandToken) : null);
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
