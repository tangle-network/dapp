import { BN } from '@polkadot/util';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import { useCallback } from 'react';

import formatTangleBalance from '../utils/formatTangleBalance';

// Centralized formatter for native token amounts with the active network symbol.
export default function useFormatNativeTokenAmount() {
  const { nativeTokenSymbol } = useNetworkStore();

  const formatNativeTokenAmount = useCallback(
    (amount: BN) => {
      return formatTangleBalance(amount, nativeTokenSymbol);
    },
    [nativeTokenSymbol],
  );

  return formatNativeTokenAmount;
}
