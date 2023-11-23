'use client';

import { BN_ZERO } from '@polkadot/util';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useEffect, useState } from 'react';

import { getPolkadotApiPromise } from '../../constants';
import useFormatReturnType from '../../hooks/useFormatReturnType';
import { calculateInflation } from '../../utils';

export default function useInflationPercentage(
  defaultValue: { value1: number | null } = { value1: null }
) {
  const [value1, setValue1] = useState(defaultValue.value1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const api = await getPolkadotApiPromise();
        if (!api) {
          throw WebbError.from(WebbErrorCodes.ApiNotReady);
        }

        const inflation = calculateInflation(api, BN_ZERO, BN_ZERO, BN_ZERO);
        const inflationPercentage = inflation.inflation;

        setValue1(inflationPercentage);
        setIsLoading(false);
      } catch (e) {
        console.error(
          e instanceof Error ? e : WebbError.from(WebbErrorCodes.UnknownError)
        );
        setError(e);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return useFormatReturnType({ isLoading, error, data: { value1 } });
}
