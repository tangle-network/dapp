'use client';

import { BN_ZERO } from '@polkadot/util';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useEffect, useState } from 'react';

import useRpcEndpointStore from '../../context/useRpcEndpointStore';
import useFormatReturnType from '../../hooks/useFormatReturnType';
import useLocalStorage, { LocalStorageKey } from '../../hooks/useLocalStorage';
import { calculateInflation } from '../../utils';
import { getPolkadotApiPromise } from '../../utils/polkadot';

export default function useIdealStakedPercentage(
  defaultValue: { value1: number | null } = { value1: null }
) {
  const { value: cachedValue, set: setCache } = useLocalStorage(
    LocalStorageKey.IDEAL_STAKE_PERCENTAGE,
    true
  );

  const [value1, setValue1] = useState(
    cachedValue?.value1 ?? defaultValue.value1
  );

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { rpcEndpoint } = useRpcEndpointStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const api = await getPolkadotApiPromise(rpcEndpoint);
        const inflation = calculateInflation(api, BN_ZERO, BN_ZERO, BN_ZERO);
        const idealStakePercentage = inflation.idealStake * 100;

        if (idealStakePercentage !== value1) {
          setValue1(idealStakePercentage);
          setCache({ value1: idealStakePercentage });
        }
        setIsLoading(false);
      } catch (e) {
        setError(
          e instanceof Error ? e : WebbError.from(WebbErrorCodes.UnknownError)
        );
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
