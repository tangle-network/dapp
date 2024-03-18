import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { notificationApi } from '@webb-tools/webb-ui-components';
import { useEffect, useMemo, useState } from 'react';
import type { Subscription } from 'rxjs';

import useRpcEndpointStore from '../context/useRpcEndpointStore';
import { getPolkadotApiRx } from '../utils/polkadot';

export default function useIsFirstTimeNominatorSubscription(address: string) {
  const [isAlreadyBonded, setIsAlreadyBonded] = useState<boolean | null>(false);
  const [hasNominatedValidators, setHasNominatedValidators] = useState(false);
  const [isLoadingBonded, setIsLoadingBonded] = useState(true);
  const [isLoadingNominators, setIsLoadingNominators] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { rpcEndpoint } = useRpcEndpointStore();
  const isFirstTimeNominatorLoading = isLoadingBonded || isLoadingNominators;

  const isFirstTimeNominator = useMemo(() => {
    if (isAlreadyBonded === null || hasNominatedValidators === null) {
      return null;
    }

    return !isAlreadyBonded && !hasNominatedValidators;
  }, [isAlreadyBonded, hasNominatedValidators]);

  useEffect(() => {
    let isMounted = true;
    let subIsAlreadyBonded: Subscription | null = null;
    let subHasNominatedValidators: Subscription | null = null;

    const subscribeData = async () => {
      try {
        const api = await getPolkadotApiRx(rpcEndpoint);

        subIsAlreadyBonded = api.query.staking
          .bonded(address)
          .subscribe(async (isBondedInfo) => {
            if (isMounted) {
              setIsAlreadyBonded(isBondedInfo.isSome);
              setIsLoadingBonded(false);
            }
          });

        subHasNominatedValidators = api.query.staking
          .nominators(address)
          .subscribe(async (nominatedValidators) => {
            if (isMounted) {
              setHasNominatedValidators(nominatedValidators.isSome);
              setIsLoadingNominators(false);
            }
          });
      } catch (error) {
        if (isMounted) {
          setError(
            error instanceof Error
              ? error
              : WebbError.from(WebbErrorCodes.UnknownError)
          );

          setIsLoadingBonded(false);
          setIsLoadingNominators(false);
        }
      }
    };

    subscribeData();

    return () => {
      isMounted = false;
      subIsAlreadyBonded?.unsubscribe();
      subHasNominatedValidators?.unsubscribe();
    };
  }, [address, rpcEndpoint]);

  useEffect(() => {
    if (error) {
      notificationApi({
        variant: 'error',
        message:
          error.message ||
          'Failed to check if the user is a first time nominator.',
      });
    }
  }, [error]);

  return {
    isFirstTimeNominator,
    isFirstTimeNominatorLoading,
    isFirstTimeNominatorError: error,
  };
}
