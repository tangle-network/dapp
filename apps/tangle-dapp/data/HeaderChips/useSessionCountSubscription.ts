'use client';

import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useEffect, useState } from 'react';
import type { Subscription } from 'rxjs';

import useFormatReturnType from '../../hooks/useFormatReturnType';
import { getPolkadotApiRx } from '../../utils/polkadot';

function useSessionCountSubscription(defaultValue = NaN) {
  const [session, setSession] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let sub: Subscription | null = null;

    const subscritbeData = async () => {
      try {
        const api = await getPolkadotApiRx();

        sub = api.query.session.currentIndex().subscribe((nextSession) => {
          const idx = nextSession.toNumber();

          if (isMounted) {
            setSession(idx);
            setIsLoading(false);
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

    subscritbeData();

    return () => {
      isMounted = false;
      sub?.unsubscribe();
    };
  }, []);

  return useFormatReturnType({ isLoading, error, data: session });
}

export default useSessionCountSubscription;
