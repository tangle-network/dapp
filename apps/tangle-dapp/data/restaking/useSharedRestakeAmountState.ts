import { BN } from '@polkadot/util';
import { useCallback, useRef, useState } from 'react';

import Optional from '../../utils/Optional';
import useSharedRestakeAmount from './useSharedRestakeAmount';

const useSharedRestakeAmountState = () => {
  const { sharedRestakeAmount } = useSharedRestakeAmount();

  const [sharedRestakeAmountState, setSharedRestakeAmount] =
    useState<Optional<BN> | null>(null);

  const lock = useRef(false);

  const reset = useCallback(() => {
    // Only change the value if it wasn't fetched from the API
    // before.
    if (!lock.current) {
      lock.current = true;
      setSharedRestakeAmount(sharedRestakeAmount);
    }
  }, [isLedgerAvailable, ledgerOpt]);

  return {
    sharedRestakeAmount: sharedRestakeAmountState,
    setSharedRestakeAmount,
    isLoading: ledgerResult.isLoading,
    reset,
  };
};

export default useSharedRestakeAmountState;
