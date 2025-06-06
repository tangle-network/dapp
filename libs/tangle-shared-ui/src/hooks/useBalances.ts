import { BN } from '@polkadot/util';
import useApiRx, { ObservableFactory } from './useApiRx';
import useSubstrateAddress from './useSubstrateAddress';
import { useCallback } from 'react';
import { map } from 'rxjs/operators';

import { calculateTransferableBalance } from '../utils/polkadot/balance';
import { TangleError, TangleErrorCode } from '../types/error';

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

const useBalances = () => {
  const activeSubstrateAddress = useSubstrateAddress();

  const balancesFetcher = useCallback<ObservableFactory<AccountBalances>>(
    (api) => {
      if (activeSubstrateAddress === null) {
        return new TangleError(TangleErrorCode.NO_ACTIVE_ACCOUNT);
      }

      return api.query.system.account(activeSubstrateAddress).pipe(
        map(({ data }) => {
          // Note that without the null/undefined check, an error
          // reports that `num` is undefined for some reason. Might be
          // a gap in the type definitions of PolkadotJS.
          const transferable = calculateTransferableBalance(data);

          return {
            free: data.free.toBn(),
            // The transferable balance is the total free balance minus
            // the largest lock amount.
            transferable,
            locked: data.free.sub(transferable),
          };
        }),
      );
    },
    [activeSubstrateAddress],
  );

  const { result: balances, ...other } = useApiRx(balancesFetcher);

  return {
    free: balances?.free ?? null,
    transferable: balances?.transferable ?? null,
    locked: balances?.locked ?? null,
    ...other,
  };
};

export default useBalances;
