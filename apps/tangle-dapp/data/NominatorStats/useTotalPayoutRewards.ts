'use client';

import { BN, hexToBn } from '@polkadot/util';
import { useEffect, useMemo, useState } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import useFormatReturnType from '../../hooks/useFormatReturnType';
import useLocalStorage, { LocalStorageKey } from '../../hooks/useLocalStorage';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';

export default function useTotalPayoutRewards(
  defaultValue: { value1: BN | null } = { value1: null }
) {
  const [value1, setValue1] = useState(defaultValue.value1);

  const { rpcEndpoint } = useNetworkStore();

  const { valueOpt: cachedPayouts } = useLocalStorage(
    LocalStorageKey.PAYOUTS,
    true
  );

  const address = useSubstrateAddress();

  const payoutsData = useMemo(() => {
    if (
      cachedPayouts === null ||
      cachedPayouts.value === null ||
      address === null
    ) {
      return [];
    }

    const payouts = cachedPayouts.value[rpcEndpoint]?.[address];

    return payouts ?? [];
  }, [address, cachedPayouts, rpcEndpoint]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      if (!address) {
        setValue1(null);
        setIsLoading(false);
        return;
      }

      if (payoutsData.length === 0) {
        setValue1(new BN(0));
        setIsLoading(false);
        return;
      }

      const totalPayoutRewards = payoutsData.reduce((acc, payout) => {
        const currentReward = hexToBn(
          payout.nominatorTotalRewardRaw.toString()
        );
        return acc.add(currentReward);
      }, new BN(0));

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
  }, [address, payoutsData]);

  return useFormatReturnType({ isLoading, error, data: { value1 } });
}
