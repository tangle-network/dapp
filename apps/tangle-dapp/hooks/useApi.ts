import { ApiPromise } from '@polkadot/api';
import { useCallback, useEffect, useState } from 'react';

import useNetworkStore from '../context/useNetworkStore';
import ensureError from '../utils/ensureError';
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
 * @param overrideRpcEndpoint Optional RPC endpoint to use instead of the
 * one provided by the network store.
 *
 * @returns Substrate API instance or `null` if still loading.
 */
function useApi<T>(fetcher: ApiFetcher<T>, overrideRpcEndpoint?: string) {
  const [result, setResult] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { rpcEndpoint } = useNetworkStore();

  const { result: api } = usePromise<ApiPromise | null>(
    useCallback(
      () => getApiPromise(overrideRpcEndpoint ?? rpcEndpoint),
      [overrideRpcEndpoint, rpcEndpoint],
    ),
    null,
  );

  const refetch = useCallback(async () => {
    // Api not yet ready.
    if (api === null) {
      return;
    }

    let newResult;

    // Fetch the data, and catch any errors that are thrown.
    // In certain cases, the fetcher may fail with an error. For example,
    // if a pallet isn't available on the active chain. Another example would
    // be if the active chain is mainnet, but the fetcher is trying to fetch
    // data from a testnet pallet that hasn't been deployed to mainnet yet.
    try {
      newResult = fetcher(api);
    } catch (possibleError) {
      const error = ensureError(possibleError);

      console.error(
        'Error while fetching data, this can happen when TypeScript type definitions are outdated or accessing pallets on the wrong chain:',
        error,
      );

      setError(error);

      return;
    }

    if (newResult instanceof Promise) {
      newResult.then((data) => setResult(data));
    } else {
      setError(null);
      setResult(newResult);
    }
  }, [api, fetcher]);

  // Refetch when the API changes or when the fetcher changes.
  useEffect(() => {
    refetch();
  }, [refetch]);

  return { result, error, refetch };
}

export default useApi;
