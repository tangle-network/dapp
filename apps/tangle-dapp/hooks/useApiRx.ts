'use client';

import { ApiRx } from '@polkadot/api';
import { useCallback, useEffect, useState } from 'react';
import { catchError, Observable } from 'rxjs';

import useNetworkStore from '../context/useNetworkStore';
import ensureError from '../utils/ensureError';
import { getApiRx } from '../utils/polkadot';
import usePromise from './usePromise';

export type ObservableFactory<T> = (api: ApiRx) => Observable<T> | null;

/**
 * Fetch data from the Substrate API, using RxJS. This is especially useful
 * for when real-time updates or data is needed.
 *
 * @param factory Function that takes the Substrate Rx instance
 * and returns a promise that resolves to the data to be streamed.
 *
 * If the consumer of this hook utilizes any returned state, this function
 * should be memoized using `useCallback` to avoid infinite re-render loops.
 *
 * @returns Data and request status.
 *
 * @example
 * ```ts
 * const { data: currentBlockNumber } = useApiRx(
 *  useCallback((api) => api.derive.chain.bestNumber(), [])
 * );
 * ```
 */
function useApiRx<T>(
  factory: ObservableFactory<T>,
  rpcEndpointOverride?: string,
) {
  const [result, setResult] = useState<T | null>(null);
  const [isLoading, setLoading] = useState(true);
  const { rpcEndpoint } = useNetworkStore();
  const [error, setError] = useState<Error | null>(null);

  const { result: apiRx } = usePromise(
    useCallback(
      () => getApiRx(rpcEndpointOverride ?? rpcEndpoint),
      [rpcEndpointOverride, rpcEndpoint],
    ),
    null,
  );

  const resetData = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (apiRx === null) {
      // Discard any previous data when the Promise API is not ready.
      resetData();

      return;
    }

    let observable: Observable<T> | null;

    // In certain cases, the factory may fail with an error. For example,
    // if a pallet isn't available on the active chain. Another example would
    // be if the active chain is mainnet, but the factory is trying to fetch
    // data from a testnet pallet that hasn't been deployed to mainnet yet.
    try {
      observable = factory(apiRx);
    } catch (possibleError) {
      const error = ensureError(possibleError);

      console.error(
        'Error creating subscription, this can happen when TypeScript type definitions are outdated or accessing pallets on the wrong chain:',
        error,
      );

      setError(error);
      setLoading(false);

      return;
    }

    // The factory is not yet ready to produce an observable.
    // Discard any previous data
    if (observable === null) {
      resetData();

      return;
    }

    const subscription = observable
      .pipe(
        catchError((possibleError: unknown) => {
          setError(ensureError(possibleError));
          setLoading(false);

          // By returning an empty observable, the subscription will be
          // automatically completed, effectively unsubscribing from the
          // observable. Since the empty observable emits nothing, the
          // data/state is left unchanged.
          return new Observable<T>();
        }),
      )
      .subscribe((newResult) => {
        setResult(newResult);
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, [factory, apiRx, resetData]);

  return { result, isLoading, error };
}

export default useApiRx;
