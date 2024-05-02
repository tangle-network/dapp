'use client';

import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import useNetworkStore from '../context/useNetworkStore';
import { formatTokenBalance } from '../utils/polkadot/tokens';

// TODO: replace this function across files that convert BN
// to formatted string with the native token symbol
export default function useFormatNativeTokenAmount() {
  const { nativeTokenSymbol } = useNetworkStore();

  const formatNativeTokenAmount = useCallback(
    (amount: BN) => {
      return formatTokenBalance(amount, nativeTokenSymbol);
    },
    [nativeTokenSymbol]
  );

  return formatNativeTokenAmount;
}
