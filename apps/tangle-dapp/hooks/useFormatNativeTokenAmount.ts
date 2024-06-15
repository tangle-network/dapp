'use client';

import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import useNetworkStore from '../context/useNetworkStore';
import { formatTangleAmount } from '../utils/formatTangleAmount';

// TODO: replace this function across files that convert BN
// to formatted string with the native token symbol
export default function useFormatNativeTokenAmount() {
  const { nativeTokenSymbol } = useNetworkStore();

  const formatNativeTokenAmount = useCallback(
    (amount: BN) => {
      return formatTangleAmount(amount, nativeTokenSymbol);
    },
    [nativeTokenSymbol],
  );

  return formatNativeTokenAmount;
}
