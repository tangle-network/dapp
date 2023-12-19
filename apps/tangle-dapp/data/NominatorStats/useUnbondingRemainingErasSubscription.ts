'use client';

import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useEffect, useState } from 'react';
import { firstValueFrom, type Subscription } from 'rxjs';

import { getPolkadotApiRx } from '../../constants';
import useFormatReturnType from '../../hooks/useFormatReturnType';

export default function useUnbondingRemainingErasSubscription(
  address: string,
  defaultValue: { value1: string | number | null } = {
    value1: null,
  }
) {
  const [value1, setValue1] = useState(defaultValue.value1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let sub: Subscription | null = null;

    const subscribeData = async () => {
      try {
        const api = await getPolkadotApiRx();
        if (!api) {
          throw WebbError.from(WebbErrorCodes.ApiNotReady);
        }

        if (!address) {
          setValue1(null);
          setIsLoading(false);
          return;
        }

        const currentEraPromise = firstValueFrom(
          api.query.staking.currentEra()
        );

        sub = api.query.staking
          .ledger(address)
          .subscribe(async (ledgerData) => {
            if (isMounted) {
              const ledger = ledgerData.unwrapOrDefault();

              const currentEraOption = await currentEraPromise;
              const currentEra = currentEraOption.unwrapOrDefault().toNumber();

              const useUnbondingRemainingEras = ledger.unlocking.map(
                (unlockChunk) => {
                  const unlockingEra = unlockChunk.era.toNumber();
                  const remainingEras = unlockingEra - currentEra;
                  return remainingEras;
                }
              );

              setValue1(useUnbondingRemainingEras[0] ?? null);
              setIsLoading(false);
            }
          });
      } catch (error) {
        if (isMounted) {
          setError(
            error instanceof Error
              ? error
              : WebbError.from(WebbErrorCodes.UnknownError)
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

  return useFormatReturnType({ isLoading, error, data: { value1 } });
}
