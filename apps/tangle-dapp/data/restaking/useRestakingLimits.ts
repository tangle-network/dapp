import { useCallback, useMemo } from 'react';
import { map } from 'rxjs';

import useApiRx from '../../hooks/useApiRx';
import useStakingLedgerRx from '../../hooks/useStakingLedgerRx';

const useRestakingLimits = () => {
  const { result: stakedBalance } = useStakingLedgerRx(
    useCallback((ledger) => ledger.total.toBn(), [])
  );

  const { result: minRestakingBond } = useApiRx(
    useCallback(
      (api) =>
        api.query.roles
          .minRestakingBond()
          .pipe(map((minRestakingBond) => minRestakingBond.toBn())),
      []
    )
  );

  // Max restaking amount = 50% of the total staked balance, which
  // is equivalent to dividing the staked balance by 2. This is taken
  // from Tangle's source code, as it seems that it is not obtainable
  // from the Polkadot API.
  // See: https://github.com/webb-tools/tangle/blob/8be20aa02a764422e1fd0ba30bc70b99d5f66887/runtime/mainnet/src/lib.rs#L1137
  const maxRestakingAmount = useMemo(
    () => stakedBalance?.divn(2) ?? null,
    [stakedBalance]
  );

  return { maxRestakingAmount, minRestakingBond };
};

export default useRestakingLimits;
