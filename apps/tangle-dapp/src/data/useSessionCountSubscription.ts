import {
  WebbError,
  WebbErrorCodes,
} from '@tangle-network/dapp-types/WebbError';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import { getApiRx } from '@tangle-network/tangle-shared-ui/utils/polkadot/api';
import { useEffect, useState } from 'react';
import type { Subscription } from 'rxjs';

import useFormatReturnType from '../hooks/useFormatReturnType';

function useSessionCountSubscription(defaultValue = NaN) {
  const [session, setSession] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const rpcEndpoint = useNetworkStore((store) => store.network.wsRpcEndpoint);

  useEffect(() => {
    let isMounted = true;
    let sub: Subscription | null = null;

    const subscribeData = async () => {
      try {
        const api = await getApiRx(rpcEndpoint);

        sub = api.query.session.currentIndex().subscribe((nextSession) => {
          const idx = nextSession.toNumber();

          if (isMounted) {
            setSession(idx);
            setIsLoading(false);
          }
        });
      } catch (error) {
        if (isMounted) {
          setError(
            error instanceof Error
              ? error
              : WebbError.from(WebbErrorCodes.UnknownError),
          );
          setIsLoading(false);
        }
      }
    };

    subscribeData();

    return () => {
      isMounted = false;
      sub?.unsubscribe();
    };
  }, [rpcEndpoint]);

  return useFormatReturnType({ isLoading, error, data: session });
}

export default useSessionCountSubscription;
