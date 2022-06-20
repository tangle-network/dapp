import { Account, Currency, CurrencyContent, WrappingEventNames } from '@webb-dapp/api-providers';
import { CrowdloanFundInfo } from '@webb-dapp/api-providers/abstracts/crowdloan';
import { useAppConfig, useWebContext } from '@webb-dapp/react-environment';
import { LoggerService } from '@webb-tools/app-util';
import { FixedPointNumber } from '@webb-tools/sdk-core';
import { BigNumber } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { FundInfo } from '@polkadot/types/interfaces';

interface CrowdloanUIState {
  // Tracks fund info of the total contributions made to the parachain
  fundInfo: CrowdloanFundInfo;
  // Track the user input for desired amount to participate with
  amount: FixedPointNumber;
}

// The useCrowdloan hook is intended to
export function useCrowdloan() {
  const { activeApi } = useWebContext();

  // The UI will look at this state to determine which options to present to the user
  const [state, setState] = useState<CrowdloanUIState>({
    amount: new FixedPointNumber(0),
    fundInfo: {
      raised: BigInt(0),
      cap: BigInt(0),
      end: BigInt(0),
    },
  });

  const { amount, fundInfo } = state;

  const crowdloanApi = useMemo(() => {
    const crowdloanApi = activeApi?.relayChainMethods?.crowdloan;
    return crowdloanApi;
  }, [activeApi]);

  const contribute = useCallback(async () => {
    if (!amount || !crowdloanApi?.enabled) {
      return;
    }

    await crowdloanApi?.inner.contribute({
      // TODO: Change to proper parachain ID
      parachainId: 2121,
      amount,
    });
  }, [crowdloanApi, amount]);

  const getFundInfo = useCallback(async () => {
    if (!crowdloanApi?.enabled) {
      return;
    }

    await crowdloanApi?.inner.getFundInfo(2121).then((fundInfo) => {
      setFundInfo(fundInfo);
    });
  }, [crowdloanApi]);

  const setAmount = (amount: FixedPointNumber) => {
    setState((p) => ({ ...p, amount }));
  };

  const setFundInfo = (fundInfo: CrowdloanFundInfo) => {
    setState((p) => ({ ...p, fundInfo }));
  };

  return {
    ...state,
    getFundInfo,
    setAmount,
    contribute,
  };
}
