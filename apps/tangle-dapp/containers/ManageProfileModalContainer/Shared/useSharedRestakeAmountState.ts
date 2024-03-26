import { BN } from '@polkadot/util';
import { useCallback, useState } from 'react';

import useSharedRestakeAmount from '../../../data/restaking/useSharedRestakeAmount';

const useSharedRestakeAmountState = () => {
  const { sharedRestakeAmount: substrateSharedRestakeAmount, isLoading } =
    useSharedRestakeAmount();

  const [sharedRestakeAmountState, setSharedRestakeAmount] =
    useState<BN | null>(null);

  const resetToSubstrateAmount = useCallback(() => {
    setSharedRestakeAmount(substrateSharedRestakeAmount?.value ?? null);
  }, [substrateSharedRestakeAmount?.value]);

  return {
    sharedRestakeAmount: sharedRestakeAmountState,
    setSharedRestakeAmount,
    isLoading,
    resetToSubstrateAmount,
  };
};

export default useSharedRestakeAmountState;
