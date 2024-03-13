import { BN } from '@polkadot/util';
import { useCallback, useRef, useState } from 'react';

import useSharedRestakeAmount from './useSharedRestakeAmount';

const useSharedRestakeAmountState = () => {
  const { sharedRestakeAmount, isLoading } = useSharedRestakeAmount();

  const [sharedRestakeAmountState, setSharedRestakeAmount] =
    useState<BN | null>(null);

  const lock = useRef(false);

  const reset = useCallback(() => {
    // Only change the value if it wasn't fetched from the API
    // before.
    if (!lock.current) {
      lock.current = true;
      setSharedRestakeAmount(sharedRestakeAmount?.value ?? null);
    }
  }, [sharedRestakeAmount]);

  return {
    sharedRestakeAmount: sharedRestakeAmountState,
    setSharedRestakeAmount,
    isLoading,
    reset,
  };
};

export default useSharedRestakeAmountState;
