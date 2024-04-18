'use client';

import { u128 } from '@polkadot/types';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useEffect, useState } from 'react';
import { Subscription } from 'rxjs';

import useNetworkStore from '../../context/useNetworkStore';
import useFormatReturnType from '../../hooks/useFormatReturnType';
import useLocalStorage, { LocalStorageKey } from '../../hooks/useLocalStorage';
import { Delegator } from '../../types';
import {
  formatTokenBalance,
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
      if (!address) {
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

                const identity = await getValidatorIdentityName(
                  rpcEndpoint,
                  target.toString()
                );

                const commission = await getValidatorCommission(
                  rpcEndpoint,
                  target.toString()
                );

                const delegationsValue = await getTotalNumberOfNominators(
                  rpcEndpoint,
                  target.toString()
                );

                const delegations = delegationsValue?.toString();

                const currentEra = await apiPromise.query.staking.currentEra();
                const exposure = await apiPromise.query.staking.erasStakers(
                  currentEra.unwrap(),
                  target.toString()
                );

                const selfStaked = new u128(
                  apiPromise.registry,
                  exposure.own.toString()
                );

                const selfStakedBalance = formatTokenBalance(
                  selfStaked,
                  nativeTokenSymbol
                );

                const totalStakeAmount = exposure.total.unwrap();
                const effectiveAmountStaked = formatTokenBalance(
                  totalStakeAmount,
                  nativeTokenSymbol
                );

                return {
                  address: target.toString(),
                  identity: identity ?? '',
                  selfStaked: selfStakedBalance ?? '',
                  isActive,
                  commission: commission ?? '',
                  delegations: delegations ?? '',
                  effectiveAmountStaked: effectiveAmountStaked ?? '',
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
  }, [address, rpcEndpoint, setCachedNominations, nativeTokenSymbol]);

  return useFormatReturnType({
    isLoading,
    error,
    data: { delegators },
  });
}
