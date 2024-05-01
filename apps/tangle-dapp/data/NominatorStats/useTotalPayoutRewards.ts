'use client';

import { BN } from '@polkadot/util';
import { useEffect, useState } from 'react';

import useFormatReturnType from '../../hooks/useFormatReturnType';
import usePayouts from '../NominationsPayouts/usePayouts';

export default function useTotalPayoutRewards(
  address: string,
  defaultValue: { value1: BN | null } = { value1: null }
) {
  const [value1, setValue1] = useState(defaultValue.value1);
  const payoutsData = usePayouts();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const totalPayoutRewards = payoutsData.reduce((acc, payout) => {
        const currentReward = BigInt(payout.nominatorTotalRewardRaw.toString());
        return acc + currentReward;
      }, BigInt(0));

      setValue1(new BN(totalPayoutRewards.toString()));
      setIsLoading(false);
    } catch (e) {
      setError(
        e instanceof Error
          ? e
          : new Error('An error occurred while calculating total payouts.')
      );
      setIsLoading(false);
    }
  }, [payoutsData]);

  return useFormatReturnType({ isLoading, error, data: { value1 } });
}
