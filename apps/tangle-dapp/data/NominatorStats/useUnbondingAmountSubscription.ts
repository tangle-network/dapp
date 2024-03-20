'use client';

import { u128 } from '@polkadot/types';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useEffect, useState } from 'react';
import { type Subscription } from 'rxjs';

import useRpcEndpointStore from '../../context/useRpcEndpointStore';
import useFormatReturnType from '../../hooks/useFormatReturnType';
import { formatTokenBalance, getPolkadotApiRx } from '../../utils/polkadot';

export default function useUnbondingAmountSubscription(
  address: string,
  defaultValue: { value1: string | number | null } = {
    value1: null,
  }
) {
  const [value1, setValue1] = useState(defaultValue.value1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { rpcEndpoint } = useRpcEndpointStore();

  useEffect(() => {
    let isMounted = true;
    let sub: Subscription | null = null;

    const subscribeData = async () => {
      try {
        const api = await getPolkadotApiRx(rpcEndpoint);

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

              const unbondingAmount = ledger.unlocking.map((unlockChunk) => {
                return unlockChunk.value.toString();
              });

              const totalUnbondingAmount = unbondingAmount.reduce(
                (accumulator, currentValue) => {
                  return accumulator + Number(currentValue);
                },
                0
              );

              const unbondingFormattedAmount = await formatTokenBalance(
                new u128(api.registry, totalUnbondingAmount.toString())
              );

              setValue1(unbondingFormattedAmount ?? null);
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
  }, [address, rpcEndpoint]);

  return useFormatReturnType({ isLoading, error, data: { value1 } });
}
