import { ApiRx } from '@polkadot/api';
import { useEffect, useState } from 'react';
import { Observable } from 'rxjs';

import { getPolkadotApiRx } from '../constants/polkadot';
import useSubstrateAddress from './useSubstrateAddress';

export type ObservableFactory<T> = (
  api: ApiRx,
  activeAccountAddress: string
) => Observable<T>;

function usePolkadotApiRx<T>(createObservable: ObservableFactory<T>) {
  const [data, setResult] = useState<T | null>(null);
  const [isLoading, setLoading] = useState(true);
  const activeSubstrateAddress = useSubstrateAddress();

  useEffect(() => {
    if (activeSubstrateAddress === null) {
      return;
    }

    const createSubscription = async () => {
      const apiRx = await getPolkadotApiRx();

      const subscription = createObservable(
        apiRx,
        activeSubstrateAddress
      ).subscribe((newResult) => {
        setResult(newResult);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    };

    createSubscription();
  }, [activeSubstrateAddress, createObservable]);

  return { data, isLoading };
}

export default usePolkadotApiRx;
