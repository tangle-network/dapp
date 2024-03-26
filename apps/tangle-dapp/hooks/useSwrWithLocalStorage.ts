import { PromiseOrT } from '@webb-tools/abstract-api-provider';
import { useEffect, useRef } from 'react';
import useSWR, { SWRConfiguration } from 'swr';

import { SwrBaseKey } from '../constants';
import useLocalStorage, {
  LocalStorageKey,
  LocalStorageValueOf,
} from './useLocalStorage';

export type SwrWithLocalStorageOptions<T extends LocalStorageKey> = {
  localStorageKey: T;
  swrKey: SwrBaseKey | [SwrBaseKey, ...unknown[]];
  swrConfig?: SWRConfiguration;
  fetcher: () => PromiseOrT<LocalStorageValueOf<T> | null>;
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

  const isInitialLoadRef = useRef(true);

  const { set: setCachedValue, get: getCachedValue } = useLocalStorage(
    options.localStorageKey,
    true
  );

  const { mutate, data, ...other } = useSWR(
    options.swrKey,
    options.fetcher,
    options.swrConfig
  );

  // Maintain the local storage value updated as the SWR
  // response changes.
  useEffect(() => {
    if (data !== undefined && data !== null) {
      setCachedValue(data);
    }
  }, [data, setCachedValue]);

  // Set initial value from local storage. This is only done once,
  // and helps to improve user-perceived initial load time.
  useEffect(() => {
    if (!isInitialLoadRef.current) {
      return;
    }

    const cachedValue = getCachedValue();
    const noResponseDataYet = data === undefined || data === null;
    const doMutate = cachedValue !== null && noResponseDataYet;

    if (doMutate) {
      mutate(cachedValue, false);
    }

    isInitialLoadRef.current = false;
  }, [data, getCachedValue, mutate]);

  return { data, mutate, ...other };
};

export default useSwrWithLocalStorage;
