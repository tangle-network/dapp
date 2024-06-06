'use client';

import { BN } from '@polkadot/util';
import { useEffect, useMemo, useState } from 'react';

import useFormatReturnType from '../../hooks/useFormatReturnType';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import { usePayoutsStore } from '../payouts/store';

export default function useTotalPayoutRewards(
  defaultValue: { value1: BN | null } = { value1: null },
) {
  const [value1, setValue1] = useState(defaultValue.value1);

  const setIsLoading = usePayoutsStore((state) => state.setIsLoading);
  const isLoading = usePayoutsStore((state) => state.isLoading);
  const data = usePayoutsStore((state) => state.data);
  const maxEras = usePayoutsStore((state) => state.maxEras);

  const address = useSubstrateAddress();

  const payoutsData = useMemo(() => {
    if (data === null || address === null) {
      return [];
    }

    return data[maxEras] ?? [];
  }, [address, data, maxEras]);

  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      if (!address) {
        setValue1(null);
        return;
      }

      if (payoutsData.length === 0) {
        setValue1(new BN(0));
        return;
      }

      const totalPayoutRewards = payoutsData.reduce((acc, payout) => {
        const currentReward = payout.nominatorTotalRewardRaw;
        return acc.add(currentReward);
      }, new BN(0));

      setValue1(new BN(totalPayoutRewards.toString()));
    } catch (e) {
      setError(
        e instanceof Error
          ? e
          : new Error('An error occurred while calculating total payouts.'),
      );
      setIsLoading(false);
    }
  }, [address, payoutsData, setIsLoading]);

  return useFormatReturnType({ isLoading, error, data: { value1 } });
}
