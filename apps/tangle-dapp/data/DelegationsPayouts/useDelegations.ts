'use client';

import { u128 } from '@polkadot/types';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useEffect, useState } from 'react';
import { Subscription } from 'rxjs';

import {
  formatTokenBalance,
  getPolkadotApiPromise,
  getPolkadotApiRx,
  getValidatorIdentity,
} from '../../constants';
import useFormatReturnType from '../../hooks/useFormatReturnType';
import { Delegator } from '../../types';

export default function useDelegations(
  address: string,
  defaultValue: { delegators: Delegator[] } = {
    delegators: [],
  }
) {
  const [delegators, setDelegators] = useState(defaultValue.delegators);
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
        if (!apiSub || !apiPromise) {
          throw WebbError.from(WebbErrorCodes.ApiNotReady);
        }

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
                const totalStaked = new u128(
                  apiPromise.registry,
                  ledgerData.total.toString()
                );
                const totalStakedBalance = await formatTokenBalance(
                  totalStaked
                );

                const isActive = await apiPromise.query.session
                  .validators()
                  .then((activeValidators) =>
                    activeValidators.some(
                      (val) => val.toString() === target.toString()
                    )
                  );

                const identity = await getValidatorIdentity(target.toString());

                return {
                  address: target.toString(),
                  identity: identity ?? '',
                  totalStaked: totalStakedBalance ?? '',
                  isActive,
                };
              })
            );

            if (isMounted) {
              setDelegators(delegators);
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
  }, [address]);

  return useFormatReturnType({
    isLoading,
    error,
    data: { delegators },
  });
}
