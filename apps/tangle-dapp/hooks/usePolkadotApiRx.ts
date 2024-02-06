import { ApiRx } from '@polkadot/api';
import { useEffect, useState } from 'react';
import { catchError, Observable } from 'rxjs';

import ensureError from '../utils/ensureError';
import { getPolkadotApiRx } from '../utils/polkadot';
import usePromise from './usePromise';
import useSubstrateAddress from './useSubstrateAddress';

export type ObservableFactory<T> = (
  api: ApiRx,
  activeSubstrateAddress: string
) => Observable<T> | null;

/**
 * Fetch data from the Polkadot API, using RxJS. This is especially useful
 * for when real-time updates or data is needed.
 *
 * @param factory Function that takes the Polkadot Rx instance
 * and returns a promise that resolves to the data to be streamed.
 *
 * @returns Data and request status.
 *
 * @example
 * ```ts
 * const { data: vestingSchedulesOpt } = usePolkadotApiRx(
 *   (api, activeSubstrateAddress) =>
 *     api.query.vesting.vesting(activeSubstrateAddress)
 * );
 * ```
 *
 * @example
 * ```
 * const { data: currentBlockNumber } = usePolkadotApiRx((api) =>
 *   api.derive.chain.bestNumber()
 * );
 * ```
 *
 * @example
 * ```ts
 * const { data: locks } = usePolkadotApiRx((api, activeSubstrateAddress) =>
 *   api.query.balances.locks(activeSubstrateAddress)
 * );
 * ```
 */
function usePolkadotApiRx<T>(factory: ObservableFactory<T>) {
  const [data, setResult] = useState<T | null>(null);
  const [isLoading, setLoading] = useState(true);
  const activeSubstrateAddress = useSubstrateAddress();
  const { result: polkadotApiRx } = usePromise(getPolkadotApiRx, null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (activeSubstrateAddress === null || polkadotApiRx === null) {
      return;
    }

    const observable = factory(polkadotApiRx, activeSubstrateAddress);

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
        setResult(newResult);
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, [activeSubstrateAddress, factory, polkadotApiRx]);

  return { data, isLoading, error };
}

export default usePolkadotApiRx;
