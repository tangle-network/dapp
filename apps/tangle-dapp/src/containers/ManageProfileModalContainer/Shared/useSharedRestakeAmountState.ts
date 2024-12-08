import { BN } from '@polkadot/util';
import noop from 'lodash/noop';
import { useState } from 'react';

const useSharedRestakeAmountState = () => {
  const [sharedRestakeAmountState, setSharedRestakeAmount] =
    useState<BN | null>(null);

  return {
    sharedRestakeAmount: sharedRestakeAmountState,
    setSharedRestakeAmount,
    isLoading: false,
    resetToSubstrateAmount: noop,
  };
};

export default useSharedRestakeAmountState;
