'use client';

import { ApiRx } from '@polkadot/api';
import { useCallback, useEffect, useState } from 'react';
import { catchError, Observable } from 'rxjs';

import useNetworkStore from '../context/useNetworkStore';
import ensureError from '../utils/ensureError';
import { getPolkadotApiRx } from '../utils/polkadot';
import usePromise from './usePromise';

export type ObservableFactory<T> = (api: ApiRx) => Observable<T> | null;

/**
 * Fetch data from the Polkadot API, using RxJS. This is especially useful
 * for when real-time updates or data is needed.
 *
 * @param factory Function that takes the Polkadot Rx instance
 * and returns a promise that resolves to the data to be streamed.
 *
 * If the consumer of this hook utilizes any returned state, this function
 * should be memoized using `useCallback` to avoid infinite re-render loops.
 *
 * @returns Data and request status.
 *
 * @example
 * ```ts
 * const { data: currentBlockNumber } = usePolkadotApiRx(
 *  useCallback((api) => api.derive.chain.bestNumber(), [])
 * );
 * ```
 *
 * @example
 * ```
 * const { value: babeExpectedBlockTime } = usePolkadotApi(
 *  useCallback((api) => Promise.resolve(api.consts.babe.expectedBlockTime), [])
 * );
 * ```
 */

function usePolkadotApiRx<T>(factory: ObservableFactory<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setLoading] = useState(true);
  const { rpcEndpoint } = useNetworkStore();
  const [error, setError] = useState<Error | null>(null);

  const { result: polkadotApiRx } = usePromise(
    useCallback(() => getPolkadotApiRx(rpcEndpoint), [rpcEndpoint]),
    null
  );

  useEffect(() => {
    // Discard any previous data when the wallet is disconnected,
    // or when the Polkadot API is not yet ready.
    if (polkadotApiRx === null) {
      setData(null);

      return;
    }

    const observable = factory(polkadotApiRx);

    // The factory is not yet ready to produce an observable.
    if (observable === null) {
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
        })
      )
      .subscribe((newResult) => {
        setData(newResult);
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, [factory, polkadotApiRx]);

  return { data, isLoading, error };
}

export default usePolkadotApiRx;
