import { PalletBalancesReasons } from '@polkadot/types/lookup';
import { BN, BN_ZERO } from '@polkadot/util';
import { useMemo } from 'react';

import { SubstrateLockId } from '../../constants';
import getSubstrateLockId from '../../utils/getSubstrateLockId';
import useBalanceLocks from './useBalanceLocks';

export type BalancesLock = {
  amount: BN | null;
  reasons: PalletBalancesReasons | null;
};

const useBalancesLock = (lockId: SubstrateLockId): BalancesLock => {
  const { locks } = useBalanceLocks();

  const amountAndReasons = useMemo(() => {
    if (locks === null) {
      return { amount: null, reasons: null };
    }

    const targetLock = locks.find(
      (lock) => getSubstrateLockId(lock.id) === lockId,
    );

    return {
      // If there are no tokens locked, default to 0.
      amount: targetLock?.amount.toBn() ?? BN_ZERO,
      reasons: targetLock?.reasons ?? null,
    };
  }, [lockId, locks]);

  return amountAndReasons;
};

export default useBalancesLock;
