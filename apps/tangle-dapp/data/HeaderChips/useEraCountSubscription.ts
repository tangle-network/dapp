'use client';

import { useEffect, useState } from 'react';
import type { Subscription } from 'rxjs';

import { getPolkadotApiRx } from '../../constants/polkadot';

export default function useEraCountSubscription(defaultValue?: number) {
  const [era, setEra] = useState(() => defaultValue);

  useEffect(() => {
    let isMounted = true;
    let sub: Subscription | null = null;

    const apiRx = getPolkadotApiRx();

    apiRx.then((api) => {
      if (!api) {
        return;
      }

      sub = api.query.staking.activeEra().subscribe((nextEra) => {
        const activeEra = nextEra.unwrapOr(null);
        if (activeEra == null) {
          return;
        }

        const idx = activeEra.index.toNumber();

        if (isMounted) {
          setEra(idx);
        }
      });
    });

    return () => {
      isMounted = false;
      sub?.unsubscribe();
    };
  }, []);

  return era;
}
