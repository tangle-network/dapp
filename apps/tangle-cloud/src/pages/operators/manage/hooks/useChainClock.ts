import { useCallback, useEffect, useRef, useState } from 'react';
import { usePublicClient } from 'wagmi';

export interface UseChainClockResult {
  nowUnixSeconds: number;
  clockError: string | null;
  refreshNow: () => Promise<void>;
}

const FALLBACK_CLOCK_ERROR =
  'Failed to read latest block time. Falling back to local clock.';

const POLL_INTERVAL_MS = 5_000;

const useChainClock = (): UseChainClockResult => {
  const publicClient = usePublicClient();
  const [nowUnixSeconds, setNowUnixSeconds] = useState(() =>
    Math.floor(Date.now() / 1000),
  );
  const [clockError, setClockError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const setSafeNow = useCallback((value: number) => {
    if (!isMountedRef.current) {
      return;
    }

    setNowUnixSeconds(value);
  }, []);

  const setSafeClockError = useCallback((value: string | null) => {
    if (!isMountedRef.current) {
      return;
    }

    setClockError(value);
  }, []);

  const refreshNow = useCallback(async () => {
    if (!publicClient) {
      setSafeNow(Math.floor(Date.now() / 1000));
      setSafeClockError(FALLBACK_CLOCK_ERROR);
      return;
    }

    try {
      const block = await publicClient.getBlock({ blockTag: 'latest' });
      setSafeNow(Number(block.timestamp));
      setSafeClockError(null);
    } catch {
      setSafeNow(Math.floor(Date.now() / 1000));
      setSafeClockError(FALLBACK_CLOCK_ERROR);
    }
  }, [publicClient, setSafeClockError, setSafeNow]);

  useEffect(() => {
    isMountedRef.current = true;
    void refreshNow();

    const interval = window.setInterval(() => {
      void refreshNow();
    }, POLL_INTERVAL_MS);

    return () => {
      isMountedRef.current = false;
      window.clearInterval(interval);
    };
  }, [refreshNow]);

  return {
    nowUnixSeconds,
    clockError,
    refreshNow,
  };
};

export default useChainClock;
