'use client';

import { formatNumber } from '@polkadot/util';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useEffect, useState } from 'react';
import { Subscription } from 'rxjs';

import useFormatReturnType from '../../hooks/useFormatReturnType';
import useLocalStorage, { LocalStorageKey } from '../../hooks/useLocalStorage';
import { getPolkadotApiPromise, getPolkadotApiRx } from '../../utils/polkadot';

export default function useActiveAndDelegationCountSubscription(
  defaultValue: { value1: number | null; value2: number | null } = {
    value1: null,
    value2: null,
  }
) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { value: cachedValue, set: setCache } = useLocalStorage(
    LocalStorageKey.ACTIVE_AND_DELEGATION_COUNT,
    true
  );

  const [value1, setValue1] = useState(
    cachedValue?.value1 ?? defaultValue.value1
  );
  const [value2, setValue2] = useState(
    cachedValue?.value2 ?? defaultValue.value2
  );

  useEffect(() => {
    let isMounted = true;
    let sub: Subscription | null = null;

    const subscribeData = async () => {
      try {
        const api = await getPolkadotApiRx();
        const apiPromise = await getPolkadotApiPromise();

        const currentEra = await apiPromise.query.staking.currentEra();
        const eraIndex = currentEra.unwrap();

        sub = api.query.staking
          .counterForNominators()
          .subscribe(async (value) => {
            try {
              const counterForNominators = formatNumber(value);
              const exposures =
                await apiPromise.query.staking.erasStakers.entries(eraIndex);

              const nominatorsSet = new Set<string>();

              exposures.forEach(([_, exposure]) => {
                exposure.others.forEach(({ who }) => {
                  nominatorsSet.add(who.toString());
                });
              });

              const newValue1 = nominatorsSet.size;
              const newValue2 = Number(counterForNominators);

              if (isMounted && (newValue1 !== value1 || newValue2 !== value2)) {
                setValue1(newValue1);
                setValue2(newValue2);
                setCache({ value1: newValue1, value2: newValue2 });
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
  }, [setCache, value1, value2]);

  return useFormatReturnType({ isLoading, error, data: { value1, value2 } });
}
