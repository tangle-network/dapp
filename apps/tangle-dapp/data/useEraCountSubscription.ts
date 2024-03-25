'use client';

import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useEffect, useState } from 'react';
import type { Subscription } from 'rxjs';

import useNetworkStore from '../context/useNetworkStore';
import useFormatReturnType from '../hooks/useFormatReturnType';
import { getPolkadotApiRx } from '../utils/polkadot';

export default function useEraCountSubscription(
  defaultValue: number | null = null
) {
  const [era, setEra] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { rpcEndpoint } = useNetworkStore();

  useEffect(() => {
    let isMounted = true;
    let sub: Subscription | null = null;

    const subscribeData = async () => {
      try {
        const api = await getPolkadotApiRx(rpcEndpoint);

        sub = api.query.staking.activeEra().subscribe((nextEra) => {
          const activeEra = nextEra.unwrapOr(null);
          if (activeEra == null) {
            return;
          }

          const idx = activeEra.index.toNumber();

          if (isMounted) {
            setEra(idx);
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

    subscribeData();

    return () => {
      isMounted = false;
      sub?.unsubscribe();
    };
  }, [rpcEndpoint]);

  return useFormatReturnType({ isLoading, error, data: era });
}
