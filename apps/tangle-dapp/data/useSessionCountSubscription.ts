'use client';

import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useEffect, useState } from 'react';
import type { Subscription } from 'rxjs';

import useNetworkStore from '../context/useNetworkStore';
import useFormatReturnType from '../hooks/useFormatReturnType';
import { getApiRx } from '../utils/polkadot';

function useSessionCountSubscription(defaultValue = NaN) {
  const [session, setSession] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { rpcEndpoint } = useNetworkStore();

  useEffect(() => {
    let isMounted = true;
    let sub: Subscription | null = null;

    const subscribeData = async () => {
      try {
        const api = await getApiRx(rpcEndpoint);

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
              : WebbError.from(WebbErrorCodes.UnknownError),
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
  }, [rpcEndpoint]);

  return useFormatReturnType({ isLoading, error, data: session });
}

export default useSessionCountSubscription;
