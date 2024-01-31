import { ApiRx } from '@polkadot/api';
import { useEffect, useState } from 'react';
import { Observable } from 'rxjs';

import { getPolkadotApiRx } from '../constants/polkadotApiUtils';
import usePromise from './usePromise';
import useSubstrateAddress from './useSubstrateAddress';

export type ObservableFactory<T> = (
  api: ApiRx,
  activeAccountAddress: string
) => Observable<T>;

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
 * const { data: vestingInfoOpt } = usePolkadotApiRx(
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

  useEffect(() => {
    if (activeSubstrateAddress === null || polkadotApiRx === null) {
      return;
    }

    const subscription = factory(
      polkadotApiRx,
      activeSubstrateAddress
    ).subscribe((newResult) => {
      setResult(newResult);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [activeSubstrateAddress, factory, polkadotApiRx]);

  return { data, isLoading };
}

export default usePolkadotApiRx;
