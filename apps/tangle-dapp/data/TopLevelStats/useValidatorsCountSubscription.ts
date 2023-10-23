'use client';

import { useEffect, useState } from 'react';
import { firstValueFrom, type Subscription } from 'rxjs';
import { getPolkadotApiRx } from '../../constants/polkadot';
import { MetricReturnType } from '../../types';

function useValidatorCountSubscription(
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
          const overview = await firstValueFrom(api.derive.staking.overview());
          const totalValidatorsCount = overview.validatorCount;

          if (!isMounted) {
            return;
          }

          setValue1(validators.length);
          setValue2(totalValidatorsCount.toNumber());
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

export default useValidatorCountSubscription;
