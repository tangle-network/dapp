import { BN } from '@polkadot/util';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { useWebbUI } from '@webb-tools/webb-ui-components';
import { useEffect, useState } from 'react';

import { getPolkadotApiPromise } from '../constants';

export type AccountBalances = {
  total: BN;
  free: BN;
  locked: BN;
};

export default function useActiveAccountBalances(): AccountBalances | null {
  const { activeAccount } = useWebContext();
  const [balances, setBalances] = useState<AccountBalances | null>(null);
  const { notificationApi } = useWebbUI();

  useEffect(() => {
    if (activeAccount === null) {
      setBalances(null);

      return;
    }

    let subscribed = true;

    const fetchBalances = async () => {
      try {
        const api = await getPolkadotApiPromise();

        const polkadotResponse = await api.query.system.account(
          activeAccount.address
        );

        if (!subscribed) {
          return;
        }

        const total = polkadotResponse.data.free.add(
          polkadotResponse.data.reserved
        );

        setBalances({
          total,
          free: polkadotResponse.data.free,
          locked: polkadotResponse.data.reserved,
        });
      } catch (error) {
        notificationApi({
          variant: 'error',
          message: 'Error fetching active account balances',
          secondaryMessage: error instanceof Error ? error.message : undefined,
        });

        if (subscribed) {
          setBalances(null);
        }
      }
    };

    fetchBalances();

    return () => {
      subscribed = false;
    };
  }, [activeAccount, notificationApi]);

  return balances;
}
