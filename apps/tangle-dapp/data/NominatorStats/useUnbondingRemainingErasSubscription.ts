'use client';

import { u128 } from '@polkadot/types';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useEffect, useState } from 'react';
import { firstValueFrom, type Subscription } from 'rxjs';

import useNetworkStore from '../../context/useNetworkStore';
import useFormatReturnType from '../../hooks/useFormatReturnType';
import { formatTokenBalance, getPolkadotApiRx } from '../../utils/polkadot';

type UnbondingRemainingEras = {
  amount: string;
  remainingEras: number;
};

export default function useUnbondingRemainingErasSubscription(
  address: string,
  defaultValue: { value1: UnbondingRemainingEras[] | null } = {
    value1: null,
  }
) {
  const [value1, setValue1] = useState(defaultValue.value1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { rpcEndpoint, nativeTokenSymbol } = useNetworkStore();

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

              const unbondingRemainingEras = ledger.unlocking.map(
                async (unlockChunk) => {
                  const unbondedAmount = unlockChunk.value;
                  const unbondingFormattedAmount = formatTokenBalance(
                    new u128(api.registry, unbondedAmount.toString()),
                    nativeTokenSymbol
                  );
                  const unlockingEra = unlockChunk.era.toNumber();
                  const remainingEras = unlockingEra - currentEra;
                  return {
                    amount: unbondingFormattedAmount ?? '',
                    remainingEras,
                  };
                }
              );

              const unbondingRemainingErasFormatted = await Promise.all(
                unbondingRemainingEras
              );

              setValue1(unbondingRemainingErasFormatted ?? null);
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
  }, [address, rpcEndpoint, nativeTokenSymbol]);

  return useFormatReturnType({ isLoading, error, data: { value1 } });
}
