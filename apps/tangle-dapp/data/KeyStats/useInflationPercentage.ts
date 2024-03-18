'use client';

import { BN_ZERO } from '@polkadot/util';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useEffect, useState } from 'react';
import { Subscription } from 'rxjs';

import useRpcEndpointStore from '../../context/useRpcEndpointStore';
import useFormatReturnType from '../../hooks/useFormatReturnType';
import { calculateInflation } from '../../utils';
import { getPolkadotApiPromise, getPolkadotApiRx } from '../../utils/polkadot';

export default function useInflationPercentage(
  defaultValue: { value1: number | null; value2: number | null } = {
    value1: null,
    value2: null,
  }
) {
  const [value1, setValue1] = useState(defaultValue.value1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { rpcEndpoint } = useRpcEndpointStore();

  useEffect(() => {
    let isMounted = true;
    let sub: Subscription | null = null;

    const fetchData = async () => {
      try {
        const apiRx = await getPolkadotApiRx(rpcEndpoint);
        const apiPromise = await getPolkadotApiPromise(rpcEndpoint);

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
            setValue1(Number(inflationPercentage.toFixed(1)));
            setIsLoading(false);
          }
        });
      } catch (e) {
        if (isMounted) {
          setError(
            e instanceof Error ? e : WebbError.from(WebbErrorCodes.UnknownError)
          );
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      sub?.unsubscribe();
    };
  }, []);

  return useFormatReturnType({
    isLoading,
    error,
    data: { value1, value2: null },
  });
}
