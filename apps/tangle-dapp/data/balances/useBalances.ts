import { BN } from '@polkadot/util';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { useCallback, useEffect, useState } from 'react';
import { map } from 'rxjs/operators';

import usePolkadotApiRx, {
  ObservableFactory,
} from '../../hooks/usePolkadotApiRx';

export type AccountBalances = {
  /**
   * The total amount of tokens in the account, including locked and
   * transferrable tokens.
   */
  total: BN | null;

  /**
   * Represents the amount of tokens that can be transferred.
   */
  transferrable: BN | null;

  /**
   * The total amount of tokens that is locked due to staking or other
   * reasons, such as vesting or being reserved.
   */
  locked: BN | null;

  misc: BN | null;
};

const useBalances = (): AccountBalances => {
  const { activeAccount } = useWebContext();
  const [balances, setBalances] = useState<AccountBalances | null>(null);

  const balancesFetcher = useCallback<ObservableFactory<AccountBalances>>(
    (api, activeAccountAddress) =>
      api.query.system.account(activeAccountAddress).pipe(
        map((accountInfo) => {
          const locked = accountInfo.data.frozen
            .add(accountInfo.data.reserved)
            // Note that without the null/undefined check, an error
            // reports that `num` is undefined for some reason. Might be
            // a gap in the type definitions of Polkadot JS.
            .add(accountInfo.data.miscFrozen || new BN(0));
          // Seems like Substrate has an interesting definition of what
          // "free" means. It's not the same as "transferrable", which
          // is what we want. See more here: https://docs.subsocial.network/rust-docs/latest/pallet_balances/struct.AccountData.html#structfield.free
          const transferrable = accountInfo.data.free.sub(locked);

          return {
            total: transferrable.add(locked),
            transferrable,
            misc: accountInfo.data.miscFrozen,
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
    transferrable: balances?.transferrable ?? null,
    locked: balances?.locked ?? null,
    misc: balances?.misc ?? null,
  };
};

export default useBalances;
