'use client';

import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useEffect, useState } from 'react';
import { firstValueFrom, type Subscription } from 'rxjs';

import useFormatReturnType from '../../hooks/useFormatReturnType';
import { getPolkadotApiRx } from '../../utils/polkadot';

export default function useActiveAndDelegationCountSubscription(
  defaultValue: { value1: number | null; value2: number | null } = {
    value1: null,
    value2: null,
  }
) {
  const [value1, setValue1] = useState(defaultValue.value1);
  const [value2, setValue2] = useState(defaultValue.value2);
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
            const [totalNominator, activeEraRes] = await Promise.all([
              firstValueFrom(api.query.staking.counterForNominators()),
              firstValueFrom(api.query.staking.activeEra()),
            ]);

            const activeEra = activeEraRes.unwrapOr(null);
            if (activeEra == null) {
              throw new Error('activeEra is null');
            }

            const currentEra = activeEra.index;
            const activeNominators = new Set<string>();

            for (const validator of validators) {
              const exposure = await firstValueFrom(
                api.query.staking.erasStakers(currentEra, validator)
              );

              exposure.others.forEach((nominator) => {
                activeNominators.add(nominator.who.toString());
              });
            }

            if (isMounted) {
              setValue1(activeNominators.size);
              setValue2(totalNominator.toNumber());
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
  }, []);

  return useFormatReturnType({ isLoading, error, data: { value1, value2 } });
}
