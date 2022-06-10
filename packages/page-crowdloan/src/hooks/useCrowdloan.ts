import { Account, Currency, CurrencyContent, WrappingEventNames } from '@webb-dapp/api-providers';
import { useAppConfig, useWebContext } from '@webb-dapp/react-environment';
import { LoggerService } from '@webb-tools/app-util';
import { useCallback, useEffect, useMemo, useState } from 'react';

// 'Governed' tokens represent a token which can be minted from a deposit
//    of various 'wrappable' tokens. Governed tokens are the tokens which are bridged
//    in the webb system.
// 'Wrappable' tokens represent tokens which can be deposited into a wrapper
//    contract - which will mint an appropriate amount of 'governed' token.
interface CrowdloanUIState {
  // Tracks the currently selected governedToken.
  contributor: Account | null;
  // Track the user input for desired amount to participate with
  amount: number;
}

// The useCrowdloan hook is intended to
export function useCrowdloan() {
  const { activeApi, activeChain } = useWebContext();

  // The UI will look at this state to determine which options to present to the user
  const [state, setState] = useState<CrowdloanUIState>({
    amount: 0,
    contributor: null,
  });

  const { amount } = state;

  const crowdloanApi = useMemo(() => {
    const crowdloanApi = activeApi?.relayChainMethods?.crowdloan.contribute;
    if (!crowdloanApi?.enabled) {
      return null;
    }
    return crowdloanApi.inner;
  }, [activeApi]);

  const execute = useCallback(() => {
    if (!amount) {
      return;
    }

    crowdloanApi?.contribute({
      // TODO: Change to proper parachain ID
      parachainId: '2000',
      amount,
    });
  }, [crowdloanApi, amount]);

  const setAmount = (amount: number) => {
    setState((p) => ({ ...p, amount }));
  };

  const setContributor = (amount: number) => {
    setState((p) => ({ ...p, amount }));
  };

  return {
    ...state,
    setAmount,
    setContributor,
    execute,
  };
}
