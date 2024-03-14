import { BN } from '@polkadot/util';
import { useCallback, useState } from 'react';

import useSharedRestakeAmount from './useSharedRestakeAmount';

const useSharedRestakeAmountState = () => {
  const { sharedRestakeAmount, isLoading } = useSharedRestakeAmount();

  const [sharedRestakeAmountState, setSharedRestakeAmount] =
    useState<BN | null>(null);

  const reset = useCallback(() => {
    // Only change the value if it wasn't fetched from the API
    // before.
    if (!isLoading) {
      setSharedRestakeAmount(sharedRestakeAmount?.value ?? null);
    }
  }, [isLoading, sharedRestakeAmount?.value]);

  return {
    sharedRestakeAmount: sharedRestakeAmountState,
    setSharedRestakeAmount,
    isLoading,
    reset,
  };
};

export default useSharedRestakeAmountState;
