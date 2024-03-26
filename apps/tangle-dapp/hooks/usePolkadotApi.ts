import { ApiPromise } from '@polkadot/api';
import { useCallback, useState } from 'react';
import useSWR from 'swr';

import useNetworkStore from '../context/useNetworkStore';
import ensureError from '../utils/ensureError';
import { getPolkadotApiPromise } from '../utils/polkadot';
import usePromise from './usePromise';

export type PolkadotApiFetcher<T> = (api: ApiPromise) => Promise<T>;

export enum PolkadotApiSwrKey {
  ERA = 'era',
  STAKING_REWARDS = 'staking-rewards',
}

function getRefreshInterval(swrKey: PolkadotApiSwrKey): number {
  switch (swrKey) {
    case PolkadotApiSwrKey.ERA:
      // 1 hour.
      return 60 * 1000 * 60;
    case PolkadotApiSwrKey.STAKING_REWARDS:
      // 3 minutes.
      return 3 * 1000 * 60;
  }
}

/**
 * Fetch data from the Polkadot API, using SWR to
 * cache the response and handle revalidation.
 *
 * @param swrConfig SWR (Stale-While-Revalidate) configuration constants.
 * These define the unique key needed for caching and refresh interval for
 * the SWR cache.
 *
 * @param fetcher Function that takes the Polkadot API instance
 * and returns a promise that resolves to the data to be cached.
 * This function should **always** be memoized using `useCallback`,
 * since it is used as a dependency internally.
 *
 * @returns Polkadot API instance, request status, and fetched data.
 *
 * @remarks
 * The SWR (Stale-While-Revalidate) caching & revalidation strategy
 * is used under the hood, so its configuration is needed to configure
 * the re-fetching polling interval. [Learn more about SWR](https://swr.vercel.app/).
 *
 * If the fetcher function is not memoized using `useCallback`, the cache
 * will be refreshed every time the component re-renders, which may not be ideal.
 *
 * @example
 * ```ts
 * const { value: currentEra } = usePolkadotApi<string | null>(
 *   useCallback(
 *     (api) =>
 *       api.query.staking.currentEra().then((eraOpt) => eraOpt.toString()),
 *     []
 *   ),
 *   PolkadotApiSwrKey.Era
 * );
 *
 * // ...
 *
 * return (
 *   <div>
 *     {currentEra !== null && (
 *      <p>Current era: {currentEra}</p>
 *     )}
 *   </div>
 * )
 * ```
 */
function usePolkadotApi<T>(
  fetcher: PolkadotApiFetcher<T>,
  swrKey?: PolkadotApiSwrKey
) {
  const { rpcEndpoint } = useNetworkStore();

  const {
    result: polkadotApi,
    isLoading: isApiLoading,
    error: apiError,
  } = usePromise<ApiPromise | null>(
    useCallback(() => getPolkadotApiPromise(rpcEndpoint), [rpcEndpoint]),
    null
  );

  const [error, setError] = useState<Error | null>(apiError);

  const refetch = useCallback(async () => {
    // Wait until the Polkadot API is ready.
    if (polkadotApi === null || error !== null) {
      return Promise.resolve(null);
    }

    console.debug(`SWR: Refreshing data for '${swrKey ?? '<no key>'}'`);

    return fetcher(polkadotApi).catch((possibleError: unknown) => {
      setError(ensureError(possibleError));

      return null;
    });
  }, [error, fetcher, polkadotApi, swrKey]);

  // Include the fetcher function as part of the cache key.
  // This allows SWR to refresh the cache when the dependency
  // list of the fetcher function changes.
  const dynamicKey = [swrKey, isApiLoading, fetcher];

  // If the SWR key is not provided, disable the refresh
  // and deduping intervals. This will effectively convert
  // the fetcher into a one-time fetch, which can be manually
  // refreshed using the `refetch` function.
  const refreshInterval = swrKey ? getRefreshInterval(swrKey) : 0;

  const response = useSWR(dynamicKey, refetch, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    fallbackData: null,
    refreshInterval: refreshInterval,
    dedupingInterval: refreshInterval,
  });

  return {
    polkadotApi,
    isApiLoading,
    isValueLoading: response.data === null,
    value: response.data,
    error,
    refetch,
  };
}

export default usePolkadotApi;
