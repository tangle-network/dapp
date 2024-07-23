'use client';

import { BN } from '@polkadot/util';
import { useMemo, useState } from 'react';

import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import { usePayoutsStore } from '../payouts/store';

export default function useTotalPayoutRewards() {
  const payouts = usePayoutsStore((state) => state.data);
  const maxEras = usePayoutsStore((state) => state.maxEras);

  const address = useSubstrateAddress();

  const payoutsAtMaxEras = useMemo(() => {
    if (payouts === null || address === null) {
      return null;
    }

    return payouts[maxEras] ?? [];
  }, [address, payouts, maxEras]);

  const [error, setError] = useState<Error | null>(null);

  const totalPayoutRewards = useMemo(() => {
    // TODO: Why is there a try-catch block here? What kind of error could be thrown? The BN operations here should not throw any errors.
    try {
      // Not ready yet.
      if (address === null || payoutsAtMaxEras === null) {
        return null;
      }
      // Nothing to claim; total payouts are 0.
      else if (payoutsAtMaxEras.length === 0) {
        return new BN(0);
      }

      const totalPayoutRewards = payoutsAtMaxEras.reduce((acc, payout) => {
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
  }, [address, payoutsAtMaxEras]);

  return { error, data: totalPayoutRewards };
}
