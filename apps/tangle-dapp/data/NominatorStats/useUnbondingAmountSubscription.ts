'use client';

import { BN, BN_ZERO } from '@polkadot/util';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useEffect, useState } from 'react';
import { type Subscription } from 'rxjs';

import useNetworkStore from '../../context/useNetworkStore';
import useFormatReturnType from '../../hooks/useFormatReturnType';
import { getPolkadotApiRx } from '../../utils/polkadot';

export default function useUnbondingAmountSubscription(
  address: string,
  defaultValue: { value1: BN | null } = {
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

        sub = api.query.staking
          .ledger(address)
          .subscribe(async (ledgerData) => {
            if (isMounted) {
              const ledger = ledgerData.unwrapOrDefault();

              const totalUnbondingAmout = ledger.unlocking.reduce(
                (acc, curr) =>
                  acc.add(new BN(curr.value.toBigInt().toString())),
                BN_ZERO
              );

              setValue1(totalUnbondingAmout);
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
