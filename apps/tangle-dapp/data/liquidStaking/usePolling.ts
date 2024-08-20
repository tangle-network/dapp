import { useEffect, useState } from 'react';

export enum PollingPrimaryCacheKey {
  EXCHANGE_RATE,
  CONTRACT_READ_SUBSCRIPTION,
}

export type PollingOptions<T> = {
  fetcher: (() => Promise<T> | T) | null;
  refreshInterval?: number;
  primaryCacheKey: PollingPrimaryCacheKey;
  cacheKey?: unknown[];
};

// TODO: Use Zustand global store for caching.

const usePolling = <T>({
  fetcher,
  // Default to a 3 second refresh interval.
  refreshInterval = 3_000,
  primaryCacheKey: _primaryCacheKey,
  cacheKey: _cacheKey,
}: PollingOptions<T>) => {
  const [value, setValue] = useState<T | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      // Fetcher isn't ready to be called yet.
      if (fetcher === null) {
        return;
      }

      setIsRefreshing(true);
      setValue(await fetcher());
      setIsRefreshing(false);
    }, refreshInterval);

    return () => {
      clearInterval(interval);
    };
  }, [fetcher, refreshInterval]);

  return { value, isRefreshing };
};

export default usePolling;
