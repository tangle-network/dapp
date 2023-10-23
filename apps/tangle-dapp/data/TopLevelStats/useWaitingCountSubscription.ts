'use client';

import { useEffect, useState } from 'react';
import { type Subscription } from 'rxjs';
import { getPolkadotApiRx } from '../../constants/polkadot';
import { MetricReturnType } from '../../types';

function useWaitingCountSubscription(
  defaultValue: MetricReturnType = {}
): MetricReturnType {
  const [value1, setValue1] = useState(defaultValue.value1);

  useEffect(() => {
    let isMounted = true;
    let sub: Subscription | null = null;

    const apiRx = getPolkadotApiRx();

    apiRx.then((api) => {
      if (!api) {
        return;
      }

      sub = api.derive.staking.waitingInfo().subscribe((waitingInfo) => {
        if (!isMounted) {
          return;
        }

        setValue1(waitingInfo.waiting.length);
      });
    });

    return () => {
      isMounted = false;
      sub?.unsubscribe();
    };
  }, []);

  return {
    value1,
  };
}

export default useWaitingCountSubscription;
