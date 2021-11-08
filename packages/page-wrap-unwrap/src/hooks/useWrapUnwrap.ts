import { BridgeCurrency, useWebContext } from '@webb-dapp/react-environment';
import { Currency, CurrencyContent } from '@webb-dapp/react-environment/types/currency';
import { fromBridgeCurrencyToCurrencyView } from '@webb-dapp/ui-components/Inputs/WalletBridgeCurrencyInput/WalletBridgeCurrencyInput';
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
  const { rightHandToken, leftHandToken } = state;

  const wrapUnwrapApi = useMemo(() => {
    const w = activeApi?.methods.wrapUnwrap?.core;
    console.log(w);
    if (w?.enabled) {
      return w.inner;
    }
    return null;
  }, [activeApi]);

  useEffect(() => {
    wrapUnwrapApi?.getNativeTokens().then((tokens) => {
      setState((p) => ({
        ...p,
        tokens: tokens.map((token) => Currency.fromCurrencyId(Number(token.id))),
      }));
    });
  }, [wrapUnwrapApi]);

  useEffect(() => {
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

  const swap = useCallback(() => {
    setState((p) => ({
      ...p,
      rightHandToken: leftHandToken,
      leftHandToken: rightHandToken,
    }));
    const isNative = leftHandToken?.view.symbol.toLocaleLowerCase().indexOf('webb') === -1;
    wrapUnwrapApi?.setCurrentToken(
      leftHandToken ? { variant: isNative ? 'native-token' : 'governed-token', id: leftHandToken.view.id } : null
    );
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

  return {
    ...state,

    swap,

    setRightHandToken,
    setLeftHandToken,
  };
}
