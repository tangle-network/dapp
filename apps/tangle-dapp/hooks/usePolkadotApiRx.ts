import { ApiRx } from '@polkadot/api';
import { useEffect, useState } from 'react';
import { Observable } from 'rxjs';

import { getPolkadotApiRx } from '../constants/polkadot';
import usePromise from './usePromise';
import useSubstrateAddress from './useSubstrateAddress';

export type ObservableFactory<T> = (
  api: ApiRx,
  activeAccountAddress: string
) => Observable<T>;

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
