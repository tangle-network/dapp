import { ApiPromise } from '@polkadot/api';
import { DependencyList } from 'react';
import useSWR from 'swr';

import { getPolkadotApiPromise } from '../constants/polkadot';
import { SWRConfigConst } from '../constants/swr';
import usePromise from './usePromise';

/**
 * Fetch data from the Polkadot API, using SWR to
 * cache the response and handle revalidation.
 *
 * @param swrConfig SWR configuration constants. These define the
 * unique key needed for caching and refresh interval for the SWR cache.
 * @param fetcher Function that takes the Polkadot API instance
 * and returns a promise that resolves to the data to be cached.
 * @returns Polkadot API instance, loading state, and cached data.
 */
function usePolkadotApi<T>(
  swrConfig: SWRConfigConst,
  fetcher: (api: ApiPromise) => Promise<T>,
  deps: DependencyList = []
) {
  const { result: polkadotApi, isLoading: isApiLoading } =
    usePromise<ApiPromise | null>(getPolkadotApiPromise, null);

  // Include the dependency list as part of the cache key.
  // This allows SWR to refresh the cache when the dependency
  // list changes.
  const dynamicKey = [swrConfig.cacheUniqueKey, isApiLoading, ...deps];

  const response = useSWR(
    dynamicKey,
    async () => {
      if (polkadotApi === null) {
        return Promise.resolve(null);
      }

      return fetcher(polkadotApi);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      fallbackData: null,
      refreshInterval: swrConfig.refreshInterval,
    }
  );

  return { polkadotApi, isApiLoading, value: response.data };
}

export default usePolkadotApi;
