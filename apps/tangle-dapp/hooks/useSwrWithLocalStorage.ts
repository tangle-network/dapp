import { PromiseOrT } from '@webb-tools/abstract-api-provider';
import { useEffect, useState } from 'react';
import useSWR, { SWRConfiguration } from 'swr';

import { SwrBaseKey } from '../constants';
import useLocalStorage, {
  LocalStorageKey,
  LocalStorageValueType,
} from './useLocalStorage';

export type SwrWithLocalStorageOptions<T extends LocalStorageKey> = {
  localStorageKey: T;
  swrKey: SwrBaseKey | [SwrBaseKey, ...unknown[]];
  swrConfig?: SWRConfiguration;
  fetcher: () => PromiseOrT<LocalStorageValueType<T> | null>;
};

/**
 * Combines the use of SWR with local storage as a caching layer.
 *
 * This allows the initial data to be fetched from local storage, and then
 * updated with the SWR response. The local storage value is also updated
 * as the SWR response changes.
 *
 * The main idea is to improve the initial load time of the data.
 */
const useSwrWithLocalStorage = <T extends LocalStorageKey>(
  options: SwrWithLocalStorageOptions<T>
) => {
  // TODO: Add a logic-error catching method to prevent the use of the same hook with the same local storage key more than once at a given time.

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { value: localStorageCachedValue, set } = useLocalStorage(
    options.localStorageKey,
    true
  );

  const response = useSWR(options.swrKey, options.fetcher, options.swrConfig);

  // Maintain the local storage value updated as the SWR
  // response changes.
  useEffect(() => {
    if (response.data !== undefined && response.data !== null) {
      set(response.data);
    }
  }, [response.data, set]);

  // Set initial value from local storage. This is only done once,
  // and helps to improve user-perceived initial load time.
  useEffect(() => {
    const noResponseDataYet =
      response.data === undefined || response.data === null;

    const mutate =
      localStorageCachedValue !== null && noResponseDataYet && isInitialLoad;

    if (mutate) {
      response.mutate(localStorageCachedValue, false);
      setIsInitialLoad(false);
    }
  }, [isInitialLoad, localStorageCachedValue, response]);

  return response;
};

export default useSwrWithLocalStorage;
