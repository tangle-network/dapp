'use client';

import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useEffect, useState } from 'react';
import { firstValueFrom, Subscription } from 'rxjs';

import useNetworkStore from '../../context/useNetworkStore';
import useFormatReturnType from '../../hooks/useFormatReturnType';
import useLocalStorage, { LocalStorageKey } from '../../hooks/useLocalStorage';
import { getApiRx } from '../../utils/polkadot';

export default function useValidatorCountSubscription(
  defaultValue: { value1: number | null; value2: number | null } = {
    value1: null,
    value2: null,
  }
) {
  const { get: getCachedValue, set: setCache } = useLocalStorage(
    LocalStorageKey.VALIDATOR_COUNTS,
    true
  );

  const [value1, setValue1] = useState(defaultValue.value1);
  const [value2, setValue2] = useState(defaultValue.value2);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { rpcEndpoint } = useNetworkStore();

  // After mount, try to get the cached value and set it.
  useEffect(() => {
    const cachedValue = getCachedValue();

    if (cachedValue !== null) {
      setValue1(cachedValue.value1);
      setValue2(cachedValue.value2);
      setIsLoading(false);
    }
  }, [getCachedValue]);

  useEffect(() => {
    let isMounted = true;
    let sub: Subscription | null = null;

    const subscribeData = async () => {
      try {
        const api = await getApiRx(rpcEndpoint);

        sub = api.query.session.validators().subscribe(async (validators) => {
          try {
            const overview = await firstValueFrom(
              api.derive.staking.overview()
            );
            const totalValidatorsCount = overview.validatorCount;

            if (
              isMounted &&
              (validators.length !== value1 ||
                totalValidatorsCount.toNumber() !== value2)
            ) {
              setValue1(validators.length);
              setValue2(totalValidatorsCount.toNumber());
              setCache({
                value1: validators.length,
                value2: totalValidatorsCount.toNumber(),
              });
              setIsLoading(false);
            }
          } catch (error) {
            if (isMounted) {
              setError(
                error instanceof Error
                  ? error
                  : WebbError.from(WebbErrorCodes.UnknownError)
              );
              setIsLoading(false);
            }
          }
        });
      } catch (error) {
        if (isMounted) {
          setError(
            error instanceof Error
              ? error
              : WebbError.from(WebbErrorCodes.UnknownError)
          );
          setIsLoading(false);
        }
      }
    };

    subscribeData();

    return () => {
      isMounted = false;
      sub?.unsubscribe();
    };
  }, [value1, value2, setCache, rpcEndpoint]);

  return useFormatReturnType({ isLoading, error, data: { value1, value2 } });
}
