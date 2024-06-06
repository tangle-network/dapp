'use client';

import { BN } from '@polkadot/util';
import { useMemo, useState } from 'react';

import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import { usePayoutsStore } from '../payouts/store';

export default function useTotalPayoutRewards() {
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

  const totalPayoutRewards = useMemo(() => {
    try {
      if (!address) {
        return null;
      }

      if (payoutsData.length === 0) {
        return new BN(0);
      }

      const totalPayoutRewards = payoutsData.reduce((acc, payout) => {
        const currentReward = payout.nominatorTotalRewardRaw;
        return acc.add(currentReward);
      }, new BN(0));

      return new BN(totalPayoutRewards.toString());
    } catch (e) {
      setError(
        e instanceof Error
          ? e
          : new Error('An error occurred while calculating total payouts.'),
      );
      return null;
    }
  }, [address, payoutsData]);

  return { error, data: totalPayoutRewards };
}
