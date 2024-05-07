import { BN, BN_ZERO, bnMax } from '@polkadot/util';
import { useCallback, useEffect, useState } from 'react';
import { map } from 'rxjs/operators';

import usePolkadotApiRx, {
  ObservableFactory,
} from '../../hooks/usePolkadotApiRx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';

export type AccountBalances = {
  /**
   * The amount of tokens that are not reserved, but may still be
   * subject to locks or vesting schedules preventing them from being
   * transferred immediately.
   *
   * Also represents the total amount of tokens in the account.
   */
  free: BN | null;

  /**
   * The amount of tokens that are not locked, and can be sent around
   * to other accounts, or used without restrictions.
   */
  transferable: BN | null;

  /**
   * The amount of tokens that are locked, and cannot be used for
   * transfers or certain operations. These tokens may be locked due
   * to staking, vesting, democracy, or other reasons.
   */
  locked: BN | null;
};

const useBalances = (): AccountBalances &
  Pick<ReturnType<typeof usePolkadotApiRx>, 'error' | 'isLoading'> => {
  const activeSubstrateAddress = useSubstrateAddress();
  const [balances, setBalances] = useState<AccountBalances | null>(null);

  const balancesFetcher = useCallback<ObservableFactory<AccountBalances>>(
    (api) => {
      if (!activeSubstrateAddress) return null;

      return api.query.system.account(activeSubstrateAddress).pipe(
        map(({ data }) => {
          // Note that without the null/undefined check, an error
          // reports that `num` is undefined for some reason. Might be
          // a gap in the type definitions of PolkadotJS.
          const maxFrozen = bnMax(
            data.frozen ?? BN_ZERO,
            data.miscFrozen ?? BN_ZERO,
            data.feeFrozen ?? BN_ZERO
          );

          const transferable = BN.max(
            data.free.sub(maxFrozen).sub(data.reserved ?? BN_ZERO),
            BN_ZERO
          );

          return {
            free: data.free.toBn(),
            // The transferable balance is the total free balance minus
            // the largest lock amount.
            transferable,
            locked: data.free.sub(transferable),
          };
        })
      );
    },
    [activeSubstrateAddress]
  );

  const { data, isLoading, error } = usePolkadotApiRx(balancesFetcher);

  useEffect(() => {
    // If there's data and it's not loading, set the balances.
    if (data && !isLoading) {
      setBalances(data);
    }
  }, [data, isLoading]);

  // Reset balances if there is no active account.
  useEffect(() => {
    if (activeSubstrateAddress === null) {
      setBalances(null);
    }
  }, [activeSubstrateAddress]);

  return {
    free: balances?.free ?? null,
    transferable: balances?.transferable ?? null,
    locked: balances?.locked ?? null,
    isLoading,
    error,
  };
};

export default useBalances;
