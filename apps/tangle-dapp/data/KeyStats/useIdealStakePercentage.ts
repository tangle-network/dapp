'use client';

import { BN_ZERO } from '@polkadot/util';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useEffect, useState } from 'react';

import { getPolkadotApiPromise } from '../../constants';
import useFormatReturnType from '../../hooks/useFormatReturnType';
import { calculateInflation } from '../../utils';

export default function useIdealStakedPercentage(
  defaultValue: { value1: number | null; value2: number | null } = {
    value1: null,
    value2: null,
  }
) {
  const [value1, setValue1] = useState(defaultValue.value1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const api = await getPolkadotApiPromise();
        const inflation = calculateInflation(api, BN_ZERO, BN_ZERO, BN_ZERO);
        const idealStakePercentage = inflation.idealStake * 100;

        setValue1(idealStakePercentage);
        setIsLoading(false);
      } catch (e) {
        setError(
          e instanceof Error ? e : WebbError.from(WebbErrorCodes.UnknownError)
        );
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return useFormatReturnType({
    isLoading,
    error,
    data: { value1, value2: null },
  });
}
