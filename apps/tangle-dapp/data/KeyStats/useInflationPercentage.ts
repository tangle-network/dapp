'use client';

import { BN_ZERO } from '@polkadot/util';
import { useEffect, useState } from 'react';
import { Subscription } from 'rxjs';

import useNetworkStore from '../../context/useNetworkStore';
import useFormatReturnType from '../../hooks/useFormatReturnType';
import { calculateInflation } from '../../utils';
import ensureError from '../../utils/ensureError';
import { getApiPromise, getApiRx } from '../../utils/polkadot';

export default function useInflationPercentage(
  defaultValue: { value1: number | null; value2: number | null } = {
    value1: null,
    value2: null,
  }
) {
  const [value1, setValue1] = useState(defaultValue.value1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { rpcEndpoint } = useNetworkStore();

  useEffect(() => {
    let isMounted = true;
    let sub: Subscription | null = null;

    const fetchData = async () => {
      try {
        const apiRx = await getApiRx(rpcEndpoint);
        const apiPromise = await getApiPromise(rpcEndpoint);

        setIsLoading(true);

        sub = apiRx.query.staking.currentEra().subscribe(async (currentEra) => {
          const totalStaked = await apiPromise.query.staking.erasTotalStake(
            currentEra.unwrapOrDefault()
          );

          const totalIssuance = await apiPromise.query.balances.totalIssuance();

          const inflation = calculateInflation(
            apiPromise,
            totalStaked,
            totalIssuance,
            BN_ZERO
          );

          const inflationPercentage = inflation.inflation;

          if (isMounted) {
            setValue1(Math.trunc(inflationPercentage * 10) / 10);
            setIsLoading(false);
          }
        });
      } catch (possibleError) {
        if (isMounted) {
          setError(ensureError(possibleError));
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      sub?.unsubscribe();
    };
  }, [rpcEndpoint]);

  return useFormatReturnType({
    isLoading,
    error,
    data: { value1, value2: null },
  });
}
