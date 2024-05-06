'use client';

import { formatNumber } from '@polkadot/util';
import { useCallback, useEffect, useState } from 'react';
import { map } from 'rxjs';

import useLocalStorage, { LocalStorageKey } from '../../hooks/useLocalStorage';
import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';

const DEFAULT_FLAGS_ELECTED = {
  withClaimedRewardsEras: false,
  withController: true,
  withExposure: true,
  withExposureMeta: true,
  withPrefs: true,
} as const;

export default function useActiveAndDelegationCountSubscription(
  defaultValue: { value1: number | null; value2: number | null } = {
    value1: null,
    value2: null,
  }
) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [value1, setValue1] = useState(defaultValue.value1);
  const [value2, setValue2] = useState(defaultValue.value2);

  const { get: getCachedValue, setWithPreviousValue: setCacheWithPrev } =
    useLocalStorage(LocalStorageKey.ACTIVE_AND_DELEGATION_COUNT, true);

  // After mount, try to get the cached value and set it.
  useEffect(() => {
    const cachedValue = getCachedValue();

    if (cachedValue !== null) {
      setValue1(cachedValue.value1);
      setValue2(cachedValue.value2);
      setIsLoading(false);
    }
  }, [getCachedValue]);

  const {
    isLoading: isLoadingCounterForNonimators,
    error: counterForNominatorsError,
  } = usePolkadotApiRx(
    useCallback(
      (apiRx) =>
        apiRx.query.staking.counterForNominators().pipe(
          map((nominatorsCount) => {
            const nominatorsCountNum = Number(formatNumber(nominatorsCount));
            const { value2: cachedCount } = getCachedValue() ?? {};

            if (nominatorsCountNum !== cachedCount) {
              setValue2(nominatorsCountNum);

              setCacheWithPrev((prev) => {
                const value1 = prev?.value1 ?? null;
                return { value1, value2: nominatorsCountNum };
              });
            }
          })
        ),
      [getCachedValue, setCacheWithPrev]
    )
  );

  const { isLoading: isLoadingActiveNominators, error: activeNominatorsError } =
    usePolkadotApiRx(
      useCallback(
        (apiRx) =>
          apiRx.derive.staking.electedInfo(DEFAULT_FLAGS_ELECTED).pipe(
            map((electedInfo) => {
              const nominators: Set<string> = new Set();

              for (let i = 0; i < electedInfo.info.length; i++) {
                const { exposurePaged } = electedInfo.info[i];
                const exposure = exposurePaged.isSome && exposurePaged.unwrap();
                if (!exposure) {
                  continue;
                }

                exposure.others.map(({ who }) => {
                  nominators.add(who.toString());
                });
              }

              const activeNominatorsCount = nominators.size;
              const { value1: cachedCount } = getCachedValue() ?? {};

              if (activeNominatorsCount !== cachedCount) {
                setValue1(activeNominatorsCount);

                setCacheWithPrev((prev) => {
                  const value2 = prev?.value2 ?? null;
                  return { value1: activeNominatorsCount, value2 };
                });
              }
            })
          ),
        [getCachedValue, setCacheWithPrev]
      )
    );

  // Sync the loading & error states.
  useEffect(() => {
    setIsLoading(isLoadingCounterForNonimators || isLoadingActiveNominators);
  }, [isLoadingCounterForNonimators, isLoadingActiveNominators]);

  useEffect(() => {
    setError(counterForNominatorsError || activeNominatorsError);
  }, [counterForNominatorsError, activeNominatorsError]);

  return {
    data: { value1, value2 },
    isLoading,
    error,
  };
}
