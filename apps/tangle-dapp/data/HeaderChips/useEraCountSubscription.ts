'use client';

import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useEffect, useState } from 'react';
import type { Subscription } from 'rxjs';

import { getPolkadotApiRx } from '../../constants/polkadotApiUtils';
import useFormatReturnType from '../../hooks/useFormatReturnType';

export default function useEraCountSubscription(
  defaultValue: number | null = null
) {
  const [era, setEra] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let sub: Subscription | null = null;

    const subscritbeData = async () => {
      try {
        const api = await getPolkadotApiRx();

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

    subscritbeData();

    return () => {
      isMounted = false;
      sub?.unsubscribe();
    };
  }, []);

  return useFormatReturnType({ isLoading, error, data: era });
}
