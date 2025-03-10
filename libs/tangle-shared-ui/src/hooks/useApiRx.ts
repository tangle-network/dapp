'use client';

import { ApiRx } from '@polkadot/api';
import { useCallback, useEffect, useRef, useState } from 'react';
import { catchError, EMPTY, Observable } from 'rxjs';
import useNetworkStore from '../context/useNetworkStore';
import usePromise from './usePromise';
import { getApiRx } from '../utils/polkadot/api';
import ensureError from '../utils/ensureError';

export type ObservableFactory<T> = (api: ApiRx) => Observable<T> | Error | null;

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
const useApiRx = <T>(factory: ObservableFactory<T>) => {
  const [result, setResult] = useState<T | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);
  const rpcEndpoint = useNetworkStore((store) => store.network2?.wsRpcEndpoint);

  const { result: apiRx } = usePromise(
    useCallback(async () => {
      if (rpcEndpoint === undefined) {
        return null;
      }

      return await getApiRx(rpcEndpoint);
    }, [rpcEndpoint]),
    null,
  );

  const reset = useCallback(() => {
    setLoading(true);
    setResult(null);
    setError(null);
  }, []);

  // Create the subscription when the API is ready.
  useEffect(() => {
    isMountedRef.current = true;

    if (apiRx === null) {
      return;
    }

    let observable: Observable<T> | null;

    // In certain cases, the factory may fail with an error. For example,
    // if a pallet isn't available on the active chain. Another example would
    // be if the active chain is mainnet, but the factory is trying to fetch
    // data from a testnet pallet that hasn't been deployed to mainnet yet.
    try {
      const factoryResult = factory(apiRx);

      if (factoryResult instanceof Error) {
        setError(factoryResult);
        setLoading(false);

        return;
      }
      // The factory is not yet ready to produce an observable.
      else if (factoryResult === null) {
        reset();

        return;
      } else {
        observable = factoryResult;
      }
    } catch (possibleError) {
      const newError = ensureError(possibleError);

      console.error(
        'Error creating subscription, this can happen when TypeScript type definitions are outdated or accessing pallets on the wrong chain:',
        newError,
      );

      setError(newError);
      setLoading(false);

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
          return EMPTY;
        }),
      )
      .subscribe((newResult) => {
        if (!isMountedRef.current) {
          return;
        }
        setResult(newResult);
        setLoading(false);
      });

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [factory, apiRx, reset]);

  // Reset the result when the RPC endpoint changes.
  useEffect(() => {
    setResult(null);
  }, [rpcEndpoint]);

  return { result, isLoading, error };
};

export default useApiRx;
