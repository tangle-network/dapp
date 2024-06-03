'use client';

import { formatNumber } from '@polkadot/util';
import { DEFAULT_FLAGS_ELECTED } from '@webb-tools/dapp-config/constants/tangle';
import { useCallback, useEffect, useState } from 'react';
import { map } from 'rxjs';

import useApiRx from '../../hooks/useApiRx';

export default function useActiveAndDelegationCountSubscription(
  defaultValue: { value1: number | null; value2: number | null } = {
    value1: null,
    value2: null,
  },
) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [value1, setValue1] = useState(defaultValue.value1);
  const [value2, setValue2] = useState(defaultValue.value2);

  const {
    isLoading: isLoadingCounterForNominators,
    error: counterForNominatorsError,
  } = useApiRx(
    useCallback(
      (apiRx) =>
        apiRx.query.staking.counterForNominators().pipe(
          map((nominatorsCount) => {
            const nominatorsCountNum = Number(formatNumber(nominatorsCount));

            setValue2(nominatorsCountNum);
          }),
        ),
      [],
    ),
  );

  const { isLoading: isLoadingActiveNominators, error: activeNominatorsError } =
    useApiRx(
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

              setValue1(activeNominatorsCount);
            }),
          ),
        [],
      ),
    );

  // Sync the loading & error states.
  useEffect(() => {
    setIsLoading(isLoadingCounterForNominators || isLoadingActiveNominators);
  }, [isLoadingCounterForNominators, isLoadingActiveNominators]);

  useEffect(() => {
    setError(counterForNominatorsError || activeNominatorsError);
  }, [counterForNominatorsError, activeNominatorsError]);

  return {
    data: { value1, value2 },
    isLoading,
    error,
  };
}
