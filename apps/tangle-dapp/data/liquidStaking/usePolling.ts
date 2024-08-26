import { useCallback, useEffect, useState } from 'react';

export type PollingOptions<T> = {
  effect: (() => Promise<T> | T) | null;
  refreshInterval?: number;
};

const usePolling = <T>({
  effect,
  // Default to a 12 second refresh interval. This default is also
  // convenient since it matches the expected block time of Ethereum
  // as well as some Substrate-based chains.
  refreshInterval = 12_000,
}: PollingOptions<T>) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    // Fetcher isn't ready to be called yet.
    if (effect === null) {
      return;
    }

    setIsRefreshing(true);
    await effect();
    setIsRefreshing(false);
  }, [effect]);

  useEffect(() => {
    let intervalHandle: ReturnType<typeof setInterval> | null = null;

    (async () => {
      // Call it immediately to avoid initial delay.
      await refresh();

      intervalHandle = setInterval(refresh, refreshInterval);
    })();

    return () => {
      if (intervalHandle !== null) {
        clearInterval(intervalHandle);
      }
    };
  }, [effect, refresh, refreshInterval]);

  return isRefreshing;
};

export default usePolling;
