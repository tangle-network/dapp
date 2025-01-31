import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import { getApiRx } from '@webb-tools/tangle-shared-ui/utils/polkadot/api';
import { useEffect, useState } from 'react';
import { firstValueFrom, Subscription } from 'rxjs';

export default function useValidatorCountSubscription(
  defaultValue: { value1: number | null; value2: number | null } = {
    value1: null,
    value2: null,
  },
) {
  const [value1, setValue1] = useState(defaultValue.value1);
  const [value2, setValue2] = useState(defaultValue.value2);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const rpcEndpoint = useNetworkStore((store) => store.network.wsRpcEndpoint);

  useEffect(() => {
    let isMounted = true;
    let sub: Subscription | null = null;

    const subscribeData = async () => {
      try {
        const api = await getApiRx(rpcEndpoint);

        sub = api.query.session.validators().subscribe(async (validators) => {
          try {
            const overview = await firstValueFrom(
              api.derive.staking.overview(),
            );
            const totalValidatorsCount = overview.validatorCount;

            if (
              isMounted &&
              (validators.length !== value1 ||
                totalValidatorsCount.toNumber() !== value2)
            ) {
              setValue1(validators.length);
              setValue2(totalValidatorsCount.toNumber());
              setIsLoading(false);
            }
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
  }, [value1, value2, rpcEndpoint]);

  return {
    data: { value1, value2 },
    isLoading,
    error,
  };
}
