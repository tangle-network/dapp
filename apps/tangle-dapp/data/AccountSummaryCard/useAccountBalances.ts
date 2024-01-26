import { BN } from '@polkadot/util';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { useCallback, useEffect, useState } from 'react';
import { map } from 'rxjs/operators';

import usePolkadotApiRx, {
  ObservableFactory,
} from '../../hooks/usePolkadotApiRx';

export type AccountBalances = {
  total: BN;
  free: BN;
  locked: BN;
  misc: BN;
};

export default function useAccountBalances(): AccountBalances | null {
  const { activeAccount } = useWebContext();
  const [balances, setBalances] = useState<AccountBalances | null>(null);

  const balancesFetcher = useCallback<ObservableFactory<AccountBalances>>(
    (api, activeAccountAddress) =>
      api.query.system.account(activeAccountAddress).pipe(
        map((accountInfo) => ({
          total: accountInfo.data.free.add(accountInfo.data.reserved),
          free: accountInfo.data.free,
          locked: accountInfo.data.frozen
            .add(accountInfo.data.reserved)
            // Note that without the null/undefined check, an error
            // reports that `num` is undefined for some reason. Might be
            // a gap in the types.
            .add(accountInfo.data.miscFrozen || new BN(0)),
          misc: accountInfo.data.miscFrozen,
        }))
      ),
    []
  );

  const { data, isLoading } = usePolkadotApiRx(balancesFetcher);

  useEffect(() => {
    // If there's data and it's not loading, set the balances.
    if (data && !isLoading) {
      setBalances(data);
    }
  }, [data, isLoading]);

  // Reset balances if there is no active account.
  useEffect(() => {
    if (activeAccount === null) {
      setBalances(null);
    }
  }, [activeAccount]);

  return balances;
}
