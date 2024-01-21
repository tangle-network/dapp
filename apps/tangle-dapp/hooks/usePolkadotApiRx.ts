import { ApiRx } from '@polkadot/api';
import { useActiveAccount } from '@webb-tools/api-provider-environment/WebbProvider/subjects';
import { useEffect, useState } from 'react';
import { Observable } from 'rxjs';

import { getPolkadotApiRx } from '../constants/polkadot';

export type ObservableFactory<T> = (
  api: ApiRx,
  activeAccountAddress: string
) => Observable<T>;

function usePolkadotApiRx<T>(createObservable: ObservableFactory<T>) {
  const [data, setResult] = useState<T | null>(null);
  const [isLoading, setLoading] = useState(true);
  const activeAccount = useActiveAccount();
  const activeAccountAddress = activeAccount[0]?.address;

  useEffect(() => {
    if (activeAccountAddress === undefined) {
      return;
    }

    const createSubscription = async () => {
      const apiRx = await getPolkadotApiRx();

      const subscription = createObservable(
        apiRx,
        activeAccountAddress
      ).subscribe((newResult) => {
        setResult(newResult);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    };

    createSubscription();
  }, [activeAccountAddress, createObservable]);

  return { data, isLoading };
}

export default usePolkadotApiRx;
