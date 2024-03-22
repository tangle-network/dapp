'use client';

import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useEffect, useState } from 'react';
import { Subscription } from 'rxjs';

import useRpcEndpointStore from '../../context/useRpcEndpointStore';
import useFormatReturnType from '../../hooks/useFormatReturnType';
import useLocalStorage, { LocalStorageKey } from '../../hooks/useLocalStorage';
import { getPolkadotApiRx } from '../../utils/polkadot';

export default function useWaitingCountSubscription(
  defaultValue: { value1: number | null; value2: number | null } = {
    value1: null,
    value2: null,
  }
) {
  const { get: getCachedValue, set: setCache } = useLocalStorage(
    LocalStorageKey.WAITING_COUNT,
    true
  );

  const [value1, setValue1] = useState(defaultValue.value1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { rpcEndpoint } = useRpcEndpointStore();

  // After mount, try to get the cached value and set it.
  useEffect(() => {
    const cachedValue = getCachedValue();

    if (cachedValue !== null) {
      setValue1(cachedValue.value1);
      setIsLoading(false);
    }
  }, [getCachedValue]);

  useEffect(() => {
    let isMounted = true;
    let sub: Subscription | null = null;

    const subscribeData = async () => {
      try {
        const api = await getPolkadotApiRx(rpcEndpoint);

        sub = api.derive.staking.waitingInfo().subscribe((waitingInfo) => {
          const newWaitingCount = waitingInfo.waiting.length;

          if (isMounted && newWaitingCount !== value1) {
            setValue1(newWaitingCount);
            setCache({ value1: newWaitingCount });
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
  }, [value1, setCache, rpcEndpoint]);

  return useFormatReturnType({
    isLoading,
    error,
    data: { value1, value2: null },
  });
}
