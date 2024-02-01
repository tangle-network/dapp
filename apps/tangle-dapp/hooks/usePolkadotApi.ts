import { ApiPromise } from '@polkadot/api';
import { DependencyList, useCallback, useState } from 'react';
import useSWR from 'swr';

import { getPolkadotApiPromise } from '../constants/polkadotApiUtils';
import { SWRConfigConst } from '../constants/swr';
import ensureError from '../utils/ensureError';
import usePromise from './usePromise';

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
 *
 * @returns Polkadot API instance, request status, and fetched data.
 *
 * @remarks
 * The SWR (Stale-While-Revalidate) caching & revalidation strategy
 * is used under the hood, so its configuration is needed to configure
 * the re-fetching polling interval. [Learn more about SWR](https://swr.vercel.app/).
 *
 * @example
 * ```ts
 * const { value: currentEra } = usePolkadotApi(SWR_ERA, (api) =>
 *  api.query.staking.currentEra().then((era) => era.toString())
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
  swrConfig: SWRConfigConst,
  fetcher: (api: ApiPromise) => Promise<T>,
  deps: DependencyList = []
) {
  const {
    result: polkadotApi,
    isLoading: isApiLoading,
    error: apiError,
  } = usePromise<ApiPromise | null>(getPolkadotApiPromise, null);

  const [error, setError] = useState<Error | null>(apiError);

  const runFetcher = useCallback(async () => {
    // Wait until the Polkadot API is ready.
    if (polkadotApi === null || error !== null) {
      return Promise.resolve(null);
    }

    return fetcher(polkadotApi).catch((possibleError: unknown) => {
      setError(ensureError(possibleError));

      return null;
    });
  }, [error, fetcher, polkadotApi]);

  // Include the dependency list as part of the cache key.
  // This allows SWR to refresh the cache when the dependency
  // list changes.
  const dynamicKey = [swrConfig.cacheUniqueKey, isApiLoading, ...deps];

  const response = useSWR(dynamicKey, runFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    fallbackData: null,
    refreshInterval: swrConfig.refreshInterval,
  });

  return {
    polkadotApi,
    isApiLoading,
    value: response.data,
    error,
  };
}

export default usePolkadotApi;
