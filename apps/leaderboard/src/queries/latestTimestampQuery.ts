import { useQuery } from '@tanstack/react-query';
import { LATEST_TIMESTAMP_QUERY_KEY } from '../constants/query';
import { Network } from '../types';

type UseLatestTimestampResult<TNetwork extends Network> = TNetwork extends 'all'
  ? {
      mainnetTimestamp: number;
      testnetTimestamp: number;
    }
  : TNetwork extends 'TESTNET'
    ? {
        mainnetTimestamp: never;
        testnetTimestamp: number;
      }
    : TNetwork extends 'MAINNET'
      ? {
          mainnetTimestamp: number;
          testnetTimestamp: never;
        }
      : never;

/**
 * Returns current timestamps for use with Envio queries.
 * Envio uses timestamps (in seconds) instead of block numbers for filtering.
 */
const fetcher = async <TNetwork extends Network>(
  network: TNetwork,
): Promise<UseLatestTimestampResult<TNetwork>> => {
  // Get current timestamp in seconds (Envio uses Unix timestamps)
  const currentTimestamp = Math.floor(Date.now() / 1000);

  if (network === 'all') {
    return {
      testnetTimestamp: currentTimestamp,
      mainnetTimestamp: currentTimestamp,
    } as UseLatestTimestampResult<TNetwork>;
  }

  if (network === 'TESTNET') {
    return {
      testnetTimestamp: currentTimestamp,
    } as UseLatestTimestampResult<TNetwork>;
  }

  return {
    mainnetTimestamp: currentTimestamp,
  } as UseLatestTimestampResult<TNetwork>;
};

export function useLatestTimestamp<TNetwork extends Network>(
  network: TNetwork,
) {
  return useQuery({
    queryKey: [LATEST_TIMESTAMP_QUERY_KEY, network],
    queryFn: () => fetcher(network),
    staleTime: Infinity,
  });
}
