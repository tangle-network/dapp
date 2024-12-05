'use client';

import { BN } from '@polkadot/util';

import { useBalancesContext } from '../../context/BalancesContext';
import useFormatReturnType from '../../hooks/useFormatReturnType';

export default function useTokenWalletFreeBalance(
  defaultValue: { value1: BN | null } = { value1: null },
) {
  const { free, isLoading, error } = useBalancesContext();

  return useFormatReturnType({
    isLoading,
    error,
    data: { value1: free ?? defaultValue.value1 },
  });
}
