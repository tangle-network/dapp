'use client';

import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useEffect, useState } from 'react';
import { firstValueFrom, Subscription } from 'rxjs';

import useFormatReturnType from '../../hooks/useFormatReturnType';
import useLocalStorage, { LocalStorageKey } from '../../hooks/useLocalStorage';
import { getPolkadotApiRx } from '../../utils/polkadot';

export default function useValidatorCountSubscription(
  defaultValue: { value1: number | null; value2: number | null } = {
    value1: null,
    value2: null,
  }
) {
  const { value: cachedValue, set: setCache } = useLocalStorage(
    LocalStorageKey.ValidatorCounts,
    true
  );

  const [value1, setValue1] = useState(
    cachedValue?.value1 ?? defaultValue.value1
  );
  const [value2, setValue2] = useState(
    cachedValue?.value2 ?? defaultValue.value2
  );

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let sub: Subscription | null = null;

    const subscribeData = async () => {
      try {
        const api = await getPolkadotApiRx();

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
  }, [value1, value2, setCache]);

  return useFormatReturnType({ isLoading, error, data: { value1, value2 } });
}
