import { useEffect, useRef, useState } from 'react';

export enum PollingPrimaryCacheKey {
  EXCHANGE_RATE,
  CONTRACT_READ_SUBSCRIPTION,
  LS_ERC20_BALANCE,
}

export type PollingOptions<T> = {
  fetcher: (() => Promise<T> | T) | null;
  refreshInterval?: number;
};

const usePolling = <T>({
  fetcher,
  // Default to a 6 second refresh interval.
  refreshInterval = 6_000,
}: PollingOptions<T>) => {
  const [value, setValue] = useState<T | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastUpdatedTimestampRef = useRef(Date.now());

  useEffect(() => {
    const intervalHandle = setInterval(async () => {
      // Fetcher isn't ready to be called yet.
      if (fetcher === null) {
        return;
      }

      const now = Date.now();
      const difference = now - lastUpdatedTimestampRef.current;

      // Don't refresh if the last refresh was less than
      // the refresh interval ago. This prevents issues where
      // the fetcher is unstable and the setInterval gets called
      // multiple times before the fetcher resolves.
      if (difference < refreshInterval) {
        return;
      }

      setIsRefreshing(true);
      setValue(await fetcher());
      lastUpdatedTimestampRef.current = now;
      setIsRefreshing(false);
    }, refreshInterval);

    return () => {
      clearInterval(intervalHandle);
    };
  }, [fetcher, refreshInterval]);

  return { value, isRefreshing };
};

export default usePolling;
