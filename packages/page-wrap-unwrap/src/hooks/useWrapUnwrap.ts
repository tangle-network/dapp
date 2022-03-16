import { useWebContext } from '@webb-dapp/react-environment';
import { Currency, CurrencyContent } from '@webb-dapp/react-environment/webb-context/currency/currency';
import { WrappingEventNames } from '@webb-dapp/react-environment/webb-context/wrap-unwrap';
import { LoggerService } from '@webb-tools/app-util';
import { useCallback, useEffect, useMemo, useState } from 'react';
const logger = LoggerService.get('useWrapUnwrap');

// 'Governed' tokens represent a token which can be minted from a deposit
//    of various 'wrappable' tokens. Governed tokens are the tokens which are bridged
//    in the webb system.
// 'Wrappable' tokens represent tokens which can be deposited into a wrapper
//    contract - which will mint an appropriate amount of 'governed' token.
interface WrapUnwrapUIState {
  // Tracks the currently selected governedToken.
  governedToken: CurrencyContent | null;
  // Tracks the currently selected wrappableToken
  wrappableToken: CurrencyContent | null;
  // Tracks the available governedTokens for selection
  //  - This depends on the WebContext's activeApi.
  governedTokens: CurrencyContent[];
  // Tracks the available wrappableTokens for selection
  //  - This depends on the WebContext's activeApi.
  wrappableTokens: CurrencyContent[];
  // Track the user input for desired amount to wrap/unwrap
  amount: number | null;
  // Track the user input for use of wrap or unwrap
  context: 'wrap' | 'unwrap';
}

// The useWrapUnwrap hook is intended to
export function useWrapUnwrap() {
  const { activeApi, activeChain } = useWebContext();

  // The UI will look at this state to determine which options to present to the user
  const [state, setState] = useState<WrapUnwrapUIState>({
    governedToken: null,
    wrappableToken: null,
    amount: null,
    governedTokens: [],
    wrappableTokens: [],
    context: 'wrap',
  });
  const { amount, context } = state;

  const wrapUnwrapApi = useMemo(() => {
    const w = activeApi?.methods.wrapUnwrap?.core;
    logger.log(w);
    if (w?.enabled) {
      return w.inner;
    }
    return null;
  }, [activeApi]);

  const initTokens = useCallback(() => {
    // Clear any previous state
    if (wrapUnwrapApi) {
      Promise.all([wrapUnwrapApi.getGovernedTokens(), wrapUnwrapApi.getWrappableTokens()]).then((values) => {
        const [governedTokens, wrappableTokens] = values;
        logger.log('setState of wrappableTokens and governedTokens in hook');
        if (governedTokens && wrappableTokens) {
          setState((p) => ({
            ...p,
            wrappableTokens: wrappableTokens!.map((token) => Currency.fromCurrencyId(token)),
            governedTokens: governedTokens!.map((token) => Currency.fromCurrencyId(token)),
          }));
        }
      });
    }
  }, [wrapUnwrapApi]);

  const swap = useCallback(() => {
    setState((p) => ({
      ...p,
      context: p.context === 'unwrap' ? 'wrap' : 'unwrap',
    }));
  }, []);

  const setWrappableToken = useCallback(
    (content: CurrencyContent | null) => {
      if (content?.view.id) {
        logger.log('setWrappableToken in useWrapUnwrap called', content.view.id);
        wrapUnwrapApi?.setWrappableToken(content.view.id);
      }
    },
    [wrapUnwrapApi]
  );

  const setGovernedToken = useCallback(
    (content: CurrencyContent | null) => {
      if (content?.view.id) {
        logger.log('setGovernedToken in useWrapUnwrap called', content.view.id);
        wrapUnwrapApi?.setGovernedToken(content.view.id);
      }
    },
    [wrapUnwrapApi]
  );

  const execute = useCallback(() => {
    if (!amount) return;

    switch (context) {
      case 'wrap':
        return wrapUnwrapApi?.wrap({ amount });
      case 'unwrap':
        return wrapUnwrapApi?.unwrap({ amount });
    }
  }, [context, wrapUnwrapApi, amount]);

  const setAmount = (amount: number | null) => {
    setState((p) => ({ ...p, amount }));
  };

  // The wrapUnwrapApi (activeApi) manages its state. This hook listens to an Observable value exposed by the wrapUnwrapApi.
  // When it receives information about a state update in the api (state for web3 / polkadot interaction),
  // it will update this hook's state (state for user display)
  useEffect(() => {
    logger.log('useEffect for wrapUnwrapApi subscription');
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
