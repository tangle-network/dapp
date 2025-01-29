import { useCallback, useEffect, useRef, useState } from 'react';

export type PollingOptions = {
  effect: (() => Promise<unknown> | unknown) | null;
  refreshInterval?: number;
};

const usePolling = ({
  effect,
  // Default to a 12 second refresh interval. This default is also
  // convenient since it matches the expected block time of Ethereum
  // as well as some Substrate-based chains.
  refreshInterval = 12_000,
}: PollingOptions) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalHandleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const effectRef = useRef(effect);
  const isMountedRef = useRef(true);

  const refresh = useCallback(async () => {
    // Fetcher isn't ready to be called yet.
    if (effect === null) {
      return;
    }

    setIsRefreshing(true);
    await effect();
    setIsRefreshing(false);
  }, [effect]);

  // Update the effect ref whenever the effect changes.
  useEffect(() => {
    effectRef.current = effect;
  }, [effect]);

  // Track whether the component is mounted to avoid state
  // or component unmounts.
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (intervalHandleRef.current !== null) {
        clearInterval(intervalHandleRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Clear any existing interval to prevent multiple intervals.
    if (intervalHandleRef.current !== null) {
      clearInterval(intervalHandleRef.current);
    }

    // Immediately invoke the effect to avoid initial delay.
    refresh();

    intervalHandleRef.current = setInterval(refresh, refreshInterval);

    // Clear the interval when dependencies change or component
    // unmounts.
    return () => {
      if (intervalHandleRef.current !== null) {
        clearInterval(intervalHandleRef.current);
        intervalHandleRef.current = null;
      }
    };
  }, [refresh, refreshInterval]);

  return isRefreshing;
};

export default usePolling;
