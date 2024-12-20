import { useMemo } from 'react';
import useBalanceLocks from '../../data/balances/useBalanceLocks';
import useBalancesLock from '../../data/balances/useBalancesLock';
import { BalanceLockRow } from '.';
import { LockUnlocksAtKind, SubstrateLockId } from '../../constants';
import { BN_ZERO } from '@polkadot/util';
import useVestingLockRows from './useVestingLockRows';

const useLockRows = () => {
  const { hasLocks } = useBalanceLocks();
  const stakingLock = useBalancesLock(SubstrateLockId.STAKING);
  const vestingRows = useVestingLockRows();

  const rows = useMemo<BalanceLockRow[]>(() => {
    if (!hasLocks) {
      return [];
    }

    const rows: BalanceLockRow[] = [];

    if (stakingLock !== null) {
      rows.push({
        type: SubstrateLockId.STAKING,
        unlocksAt: undefined,
        unlocksAtKind: LockUnlocksAtKind.ERA,
        totalLocked: stakingLock.amount ?? BN_ZERO,
        remaining: stakingLock.amount ?? BN_ZERO,
      });
    }

    if (vestingRows !== null) {
      rows.push(...vestingRows);
    }

    return rows;
  }, [hasLocks, stakingLock, vestingRows]);

  return rows;
};

export default useLockRows;
