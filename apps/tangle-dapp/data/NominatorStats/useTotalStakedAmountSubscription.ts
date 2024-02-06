'use client';

import { u128 } from '@polkadot/types';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useEffect, useState } from 'react';
import { type Subscription } from 'rxjs';

import useFormatReturnType from '../../hooks/useFormatReturnType';
import { formatTokenBalance, getPolkadotApiRx } from '../../utils/polkadot';

export default function useTotalStakedAmountSubscription(
  address: string,
  defaultValue: { value1: number | string | null } = { value1: null }
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

        if (!address) {
          setValue1(null);
          setIsLoading(false);
          return;
        }

        sub = api.query.staking
          .ledger(address)
          .subscribe(async (ledgerData) => {
            if (isMounted) {
              const ledger = ledgerData.unwrapOrDefault();
              const totalStaked = new u128(
                api.registry,
                ledger.total.toString()
              );
              const availableTokenBalance = await formatTokenBalance(
                totalStaked
              );
              setValue1(availableTokenBalance ?? null);
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
