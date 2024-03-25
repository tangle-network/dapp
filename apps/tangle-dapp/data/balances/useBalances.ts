import { BN, BN_ZERO } from '@polkadot/util';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { useCallback, useEffect, useState } from 'react';
import { map } from 'rxjs/operators';

import usePolkadotApiRx, {
  ObservableFactory,
} from '../../hooks/usePolkadotApiRx';

export type AccountBalances = {
  total: BN | null;
  free: BN | null;
  locked: BN | null;
};

const useBalances = (): AccountBalances => {
  const { activeAccount } = useWebContext();
  const [balances, setBalances] = useState<AccountBalances | null>(null);

  const balancesFetcher = useCallback<ObservableFactory<AccountBalances>>(
    (api, activeAccountAddress) =>
      api.query.system.account(activeAccountAddress).pipe(
        map((accountInfo) => {
          const locked = accountInfo.data.frozen
            // Note that without the null/undefined check, an error
            // reports that `num` is undefined for some reason. Might be
            // a gap in the type definitions of PolkadotJS.
            .add(accountInfo.data.miscFrozen || BN_ZERO)
            .add(accountInfo.data.feeFrozen || BN_ZERO);

          return {
            total: accountInfo.data.free.toBn(),
            free: accountInfo.data.free.toBn(),
            locked,
          };
        })
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

  return {
    total: balances?.total ?? null,
    free: balances?.free ?? null,
    locked: balances?.locked ?? null,
  };
};

export default useBalances;
