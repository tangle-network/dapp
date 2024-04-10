'use client';

import { BN } from '@polkadot/util';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useEffect, useState } from 'react';
import { type Subscription } from 'rxjs';

import useNetworkStore from '../../context/useNetworkStore';
import useFormatReturnType from '../../hooks/useFormatReturnType';
import { evmToSubstrateAddress } from '../../utils/evmToSubstrateAddress';
import { getPolkadotApiRx } from '../../utils/polkadot';

export default function useTokenWalletFreeBalance(
  address: string,
  defaultValue: { value1: BN | null } = { value1: null }
) {
  const [value1, setValue1] = useState(defaultValue.value1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { rpcEndpoint } = useNetworkStore();

  useEffect(() => {
    let isMounted = true;
    let sub: Subscription | null = null;

    const fetchData = async () => {
      if (!address || address === '0x0') {
        setValue1(null);
        setIsLoading(false);
        return;
      }

      try {
        const api = await getPolkadotApiRx(rpcEndpoint);
        if (!api) {
          throw WebbError.from(WebbErrorCodes.ApiNotReady);
        }

        const substrateAddress = evmToSubstrateAddress(address);

        sub = api.query.system
          .account(substrateAddress)
          .subscribe(async (accData) => {
            if (isMounted) {
              const freeBalance = accData.data.free;
              setValue1(freeBalance);
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

    fetchData();

    return () => {
      isMounted = false;
      sub?.unsubscribe();
    };
  }, [address, rpcEndpoint]);

  return useFormatReturnType({ isLoading, error, data: { value1 } });
}
