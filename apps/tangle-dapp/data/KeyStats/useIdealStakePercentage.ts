'use client';

import { BN_ZERO } from '@polkadot/util';
import { useEffect, useState } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import useFormatReturnType from '../../hooks/useFormatReturnType';
import useLocalStorage, { LocalStorageKey } from '../../hooks/useLocalStorage';
import { calculateInflation } from '../../utils';
import ensureError from '../../utils/ensureError';
import { getApiPromise } from '../../utils/polkadot';

export default function useIdealStakedPercentage(
  defaultValue: { value1: number | null } = { value1: null }
) {
  const { get: getCachedValue, set: setCache } = useLocalStorage(
    LocalStorageKey.IDEAL_STAKE_PERCENTAGE,
    true
  );

  const [value1, setValue1] = useState(defaultValue.value1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { rpcEndpoint } = useNetworkStore();

  // After mount, try to get the cached value and set it.
  useEffect(() => {
    const cachedValue = getCachedValue();

    if (cachedValue !== null) {
      setValue1(cachedValue.value1);
      setIsLoading(false);
    }
  }, [getCachedValue]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const api = await getApiPromise(rpcEndpoint);
        const inflation = calculateInflation(api, BN_ZERO, BN_ZERO, BN_ZERO);
        const idealStakePercentage = inflation.idealStake * 100;

        if (idealStakePercentage !== value1) {
          setValue1(idealStakePercentage);
          setCache({ value1: idealStakePercentage });
        }

        setIsLoading(false);
      } catch (possibleError) {
        setError(ensureError(possibleError));
        setIsLoading(false);
      }
    };

    fetchData();
  }, [value1, setCache, rpcEndpoint]);

  return useFormatReturnType({
    isLoading,
    error,
    data: { value1, value2: null },
  });
}
