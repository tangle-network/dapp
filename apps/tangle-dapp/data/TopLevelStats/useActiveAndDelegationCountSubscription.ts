'use client';

import { useEffect, useState } from 'react';
import { firstValueFrom, type Subscription } from 'rxjs';

import { getPolkadotApiRx } from '../../constants/polkadot';
import { MetricReturnType } from '../../types';

function useActiveAndDelegationCountSubscription(
  defaultValue: MetricReturnType = {}
): MetricReturnType {
  const [value1, setValue1] = useState(defaultValue.value1);
  const [value2, setValue2] = useState(defaultValue.value2);

  useEffect(() => {
    let isMounted = true;
    let sub: Subscription | null = null;

    const apiRx = getPolkadotApiRx();

    apiRx.then((api) => {
      if (!api) {
        return;
      }

      sub = api.query.session.validators().subscribe(async (validators) => {
        try {
          const [totalNominator, activeEraRes] = await Promise.all([
            firstValueFrom(api.query.staking.counterForNominators()),
            firstValueFrom(api.query.staking.activeEra()),
          ] as const);

          const activeEra = activeEraRes.unwrapOr(null);
          if (activeEra == null) {
            console.warn('activeEra is null');
            return;
          }

          const currentEra = activeEra.index;

          // Collection of unique nominator addresses - Set is used to avoid duplicates, as a nominator can nominate multiple validators
          const activeNominators = new Set<string>();

          for (const validator of validators) {
            const exposure = await firstValueFrom(
              api.query.staking.erasStakers(currentEra, validator)
            );

            exposure.others.forEach((nominator) => {
              activeNominators.add(nominator.who.toString());
            });
          }

          if (!isMounted) {
            return;
          }

          setValue1(activeNominators.size);
          setValue2(totalNominator.toNumber());
        } catch (error) {
          console.error(error);
        }
      });
    });

    return () => {
      isMounted = false;
      sub?.unsubscribe();
    };
  }, []);

  return {
    value1,
    value2,
  };
}

export default useActiveAndDelegationCountSubscription;
