import { useEffect, useState } from 'react';

export type UsePollingOptions<T> = {
  fetcher: () => Promise<T> | T;
  refreshInterval: number;
  cacheKey?: unknown[];
};

// TODO: Use Zustand global store for caching.

const usePolling = <T>({
  fetcher,
  // Default to a 3 second refresh interval.
  refreshInterval = 3_000,
  cacheKey,
}: UsePollingOptions<T>) => {
  const [value, setValue] = useState<T | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
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
