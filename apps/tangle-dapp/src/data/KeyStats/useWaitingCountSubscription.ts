import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import { getApiRx } from '@webb-tools/tangle-shared-ui/utils/polkadot/api';
import { useEffect, useState } from 'react';
import { combineLatest, Subscription } from 'rxjs';

export default function useWaitingCountSubscription(
  defaultValue: { value1: number | null; value2: number | null } = {
    value1: null,
    value2: null,
  },
) {
  const [value1, setValue1] = useState(defaultValue.value1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const rpcEndpoint = useNetworkStore((store) => store.network.wsRpcEndpoint);

  useEffect(() => {
    let isMounted = true;
    let sub: Subscription | null = null;

    const subscribeData = async () => {
      try {
        const api = await getApiRx(rpcEndpoint);

        // Combine both active validators and all validators observables
        sub = combineLatest([
          api.query.session.validators(), // Get active validators
          api.query.staking.validators.entries(), // Get all validators
        ]).subscribe(([activeValidators, allValidatorsEntries]) => {
          // Count of active validators
          const activeCount = activeValidators.length;

          // Count of all validators (filtering out empty entries)
          const totalCount = allValidatorsEntries.length;

          // Calculate waiting count as the difference
          const waitingCount = Math.max(0, totalCount - activeCount);

          if (isMounted && waitingCount !== value1) {
            setValue1(waitingCount);
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
  }, [value1, rpcEndpoint]);

  return {
    isLoading,
    error,
    data: { value1, value2: null },
  };
}
