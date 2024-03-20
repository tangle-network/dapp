'use client';

import { u128 } from '@polkadot/types';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useEffect, useState } from 'react';
import { Subscription } from 'rxjs';

import useFormatReturnType from '../../hooks/useFormatReturnType';
import useLocalStorage, { LocalStorageKey } from '../../hooks/useLocalStorage';
import { Delegator } from '../../types';
import {
  formatTokenBalance,
  getPolkadotApiPromise,
  getPolkadotApiRx,
  getTotalNumberOfNominators,
  getValidatorCommission,
  getValidatorIdentity,
} from '../../utils/polkadot';

export default function useDelegations(
  address: string,
  defaultValue: { delegators: Delegator[] } = {
    delegators: [],
  }
) {
  const {
    value: cachedNominations,
    setWithPreviousValue: setCachedNominations,
  } = useLocalStorage(LocalStorageKey.Nominations, true);
  const [delegators, setDelegators] = useState(
    (cachedNominations && cachedNominations[address]) ?? defaultValue.delegators
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
        const apiSub = await getPolkadotApiRx();
        const apiPromise = await getPolkadotApiPromise();

        setIsLoading(true);

        sub = apiSub.query.staking
          .nominators(address)
          .subscribe(async (nominatorData) => {
            const targets = nominatorData.unwrapOrDefault().targets;

            const delegators: Delegator[] = await Promise.all(
              targets.map(async (target) => {
                const ledger = await apiPromise.query.staking.ledger(
                  target.toString()
                );
                const ledgerData = ledger.unwrapOrDefault();
                const selfStaked = new u128(
                  apiPromise.registry,
                  ledgerData.total.toString()
                );
                const selfStakedBalance = await formatTokenBalance(selfStaked);

                const isActive = await apiPromise.query.session
                  .validators()
                  .then((activeValidators) =>
                    activeValidators.some(
                      (val) => val.toString() === target.toString()
                    )
                  );

                const identity = await getValidatorIdentity(target.toString());

                const commission = await getValidatorCommission(
                  target.toString()
                );

                const delegationsValue = await getTotalNumberOfNominators(
                  target.toString()
                );
                const delegations = delegationsValue?.toString();

                const currentEra = await apiPromise.query.staking.currentEra();
                const exposure = await apiPromise.query.staking.erasStakers(
                  currentEra.unwrap(),
                  target.toString()
                );
                const totalStakeAmount = exposure.total.unwrap();
                const effectiveAmountStaked = await formatTokenBalance(
                  totalStakeAmount
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
  }, [address, setCachedNominations]);

  return useFormatReturnType({
    isLoading,
    error,
    data: { delegators },
  });
}
