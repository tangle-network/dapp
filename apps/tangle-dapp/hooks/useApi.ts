import { ApiPromise } from '@polkadot/api';
import { useCallback } from 'react';

import useNetworkStore from '../context/useNetworkStore';
import { getApiPromise } from '../utils/polkadot';
import usePromise from './usePromise';

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
function useApi() {
  const { rpcEndpoint } = useNetworkStore();

  return usePromise<ApiPromise | null>(
    useCallback(() => getApiPromise(rpcEndpoint), [rpcEndpoint]),
    null
  );
}

export default useApi;
