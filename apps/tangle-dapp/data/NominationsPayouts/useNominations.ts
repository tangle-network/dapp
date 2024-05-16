'use client';

import { BN_ZERO } from '@polkadot/util';
import {
  DEFAULT_FLAGS_ELECTED,
  DEFAULT_FLAGS_WAITING,
} from '@webb-tools/dapp-config/constants/tangle';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useCallback, useEffect, useState } from 'react';
import { map, Subscription } from 'rxjs';

import useNetworkStore from '../../context/useNetworkStore';
import useFormatNativeTokenAmount from '../../hooks/useFormatNativeTokenAmount';
import useFormatReturnType from '../../hooks/useFormatReturnType';
import useLocalStorage, { LocalStorageKey } from '../../hooks/useLocalStorage';
import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';
import { Delegator } from '../../types';
import { getExposureMap } from '../../utils/getExposureMap';
import {
  getPolkadotApiPromise,
  getPolkadotApiRx,
  getTotalNumberOfNominators,
  getValidatorCommission,
  getValidatorIdentityName,
} from '../../utils/polkadot';

export default function useNominations(
  address: string,
  defaultValue: { delegators: Delegator[] } = {
    delegators: [],
  }
) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { rpcEndpoint, nativeTokenSymbol } = useNetworkStore();
  const formatNativeTokenSymbol = useFormatNativeTokenAmount();

  const { data: exposureMapElected } = usePolkadotApiRx(
    useCallback(
      (api) =>
        api.derive.staking
          .electedInfo(DEFAULT_FLAGS_ELECTED)
          .pipe(map((derive) => getExposureMap(api, derive))),
      []
    )
  );

  const { data: exposureMapWaiting } = usePolkadotApiRx(
    useCallback(
      (api) =>
        api.derive.staking
          .waitingInfo(DEFAULT_FLAGS_WAITING)
          .pipe(map((derive) => getExposureMap(api, derive))),
      []
    )
  );

  const {
    valueAfterMount: cachedNominations,
    setWithPreviousValue: setCachedNominations,
  } = useLocalStorage(LocalStorageKey.Nominations, true);

  const [delegators, setDelegators] = useState(
    (cachedNominations && cachedNominations[address]) ?? defaultValue.delegators
  );

  useEffect(() => {
    let isMounted = true;
    let sub: Subscription | null = null;

    const subscribeData = async () => {
      if (
        !address ||
        exposureMapElected === null ||
        exposureMapWaiting === null
      ) {
        if (isMounted) {
          setDelegators([]);
          setIsLoading(false);
        }

        return;
      }

      try {
        const apiSub = await getPolkadotApiRx(rpcEndpoint);
        const apiPromise = await getPolkadotApiPromise(rpcEndpoint);

        setIsLoading(true);

        sub = apiSub.query.staking
          .nominators(address)
          .subscribe(async (nominatorData) => {
            const targets = nominatorData.unwrapOrDefault().targets;

            // TODO: This needs to be optimized. Make a single request to get all the data, then work off that data. Currently, this may make many requests, depending on how many targets there are PER nominator (O(nominators * targets)).
            const delegators: Delegator[] = await Promise.all(
              targets.map(async (target) => {
                const isActive = await apiPromise.query.session
                  .validators()
                  .then((activeValidators) =>
                    activeValidators.some(
                      (val) => val.toString() === target.toString()
                    )
                  );

                const [identity, commission, delegationsValue] =
                  await Promise.all([
                    getValidatorIdentityName(rpcEndpoint, target.toString()),
                    getValidatorCommission(rpcEndpoint, target.toString()),
                    getTotalNumberOfNominators(rpcEndpoint, target.toString()),
                  ]);

                const delegations = delegationsValue?.toString();

                const { exposureMeta } = isActive
                  ? exposureMapElected[target.toString()]
                  : exposureMapWaiting[target.toString()];

                const totalStakeAmount = exposureMeta
                  ? exposureMeta.total.toBn()
                  : BN_ZERO;

                const selfStakedAmount = exposureMeta
                  ? exposureMeta.own.toBn()
                  : BN_ZERO;

                return {
                  address: target.toString(),
                  identity: identity ?? '',
                  selfStaked: formatNativeTokenSymbol(selfStakedAmount) ?? '',
                  isActive,
                  commission: commission ?? '',
                  delegations: delegations ?? '',
                  effectiveAmountStaked:
                    formatNativeTokenSymbol(totalStakeAmount) ?? '',
                };
              })
            );

            if (isMounted) {
              setDelegators(delegators);
              setCachedNominations((previous) => ({
                ...previous,
                [address]: delegators,
              }));
              setIsLoading(false);
            }
          });
      } catch (e) {
        if (isMounted) {
          setError(
            e instanceof Error ? e : WebbError.from(WebbErrorCodes.UnknownError)
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
  }, [
    address,
    rpcEndpoint,
    setCachedNominations,
    nativeTokenSymbol,
    exposureMapElected,
    exposureMapWaiting,
    formatNativeTokenSymbol,
  ]);

  return useFormatReturnType({
    isLoading,
    error,
    data: { delegators },
  });
}
