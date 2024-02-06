import { BN } from '@polkadot/util';
import { useMemo } from 'react';

import { SubstrateLockId } from '../constants';
import getSubstrateLockId from '../utils/getSubstrateLockId';
import usePolkadotApiRx from './usePolkadotApiRx';

const useBalancesLock = (lockId: SubstrateLockId) => {
  const { data: locks } = usePolkadotApiRx((api, activeSubstrateAddress) =>
    api.query.balances.locks(activeSubstrateAddress)
  );

  const amountAndReasons = useMemo(() => {
    if (locks === null) {
      return { amount: null, reasons: null };
    }

    const targetLock = locks.find(
      (lock) => getSubstrateLockId(lock.id) === lockId
    );

    return {
      // If there are no tokens locked, default to 0.
      amount: targetLock?.amount.toBn() ?? new BN(0),
      reasons: targetLock?.reasons ?? null,
    };
  }, [lockId, locks]);

  return amountAndReasons;
};

export default useBalancesLock;
