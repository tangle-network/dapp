import { u128 } from '@polkadot/types';
import { BN } from '@polkadot/util';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import useSubstrateAddress from '@webb-tools/tangle-shared-ui/hooks/useSubstrateAddress';
import { getApiRx } from '@webb-tools/tangle-shared-ui/utils/polkadot/api';
import { useEffect, useState } from 'react';
import { type Subscription } from 'rxjs';

import useFormatReturnType from '../../hooks/useFormatReturnType';

export default function useTotalStakedAmountSubscription(
  defaultValue: { value1: BN | null } = { value1: null },
) {
  const [value1, setValue1] = useState(defaultValue.value1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { rpcEndpoint, nativeTokenSymbol } = useNetworkStore();
  const address = useSubstrateAddress();

  useEffect(() => {
    let isMounted = true;
    let sub: Subscription | null = null;

    const subscribeData = async () => {
      try {
        const api = await getApiRx(rpcEndpoint);

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
                ledger.total.toString(),
              );

              setValue1(totalStaked);
              setIsLoading(false);
            }
          });
      } catch (error) {
        if (isMounted) {
          setError(
            error instanceof Error
              ? error
              : WebbError.from(WebbErrorCodes.UnknownError),
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
