import { ApiPromise } from '@polkadot/api';
import { useCallback, useEffect, useState } from 'react';

import useNetworkStore from '../context/useNetworkStore';
import { getApiPromise } from '../utils/polkadot';
import usePromise from './usePromise';

export type ApiFetcher<T> = (api: ApiPromise) => Promise<T> | T;

/**
 * Provides access to the Substrate Promise API.
 *
 * @param fetcher Function that takes the Substrate API instance
 * and returns a promise that resolves to the data to be cached.
 * This function should **always** be memoized using `useCallback`,
 * since it is used as a dependency internally.
 *
 * @returns Substrate API instance or `null` if still loading.
 */
function useApi<T>(fetcher: ApiFetcher<T>) {
  const [result, setResult] = useState<T | null>(null);
  const { rpcEndpoint } = useNetworkStore();

  const { result: api } = usePromise<ApiPromise | null>(
    useCallback(() => getApiPromise(rpcEndpoint), [rpcEndpoint]),
    null,
  );

  const refetch = useCallback(async () => {
    // Api not yet ready.
    if (api === null) {
      return;
    }

    const newResult = fetcher(api);

    if (newResult instanceof Promise) {
      newResult.then((data) => setResult(data));
    } else {
      setResult(newResult);
    }
  }, [api, fetcher]);

  // Refetch when the API changes or when the fetcher changes.
  useEffect(() => {
    refetch();
  }, [refetch]);

  return { result, refetch };
}

export default useApi;
