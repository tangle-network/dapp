'use client';

import { useEffect, useState } from 'react';
import type { Subscription } from 'rxjs';

import { getPolkadotApiRx } from '../../constants/polkadot';

function useSessionCountSubscription(defaultValue = NaN) {
  const [session, setSession] = useState(defaultValue);

  useEffect(() => {
    let isMounted = true;
    let sub: Subscription | null = null;

    const apiRx = getPolkadotApiRx();

    apiRx.then((api) => {
      if (!api) {
        return;
      }

      sub = api.query.dkg.dkgPublicKey().subscribe((currentDKGPublicKey) => {
        const currentSessionNumber = currentDKGPublicKey[0];

        if (isMounted) {
          setSession(currentSessionNumber.toNumber());
        }
      });
    });

    return () => {
      isMounted = false;
      sub?.unsubscribe();
    };
  }, []);

  return session;
}

export default useSessionCountSubscription;
