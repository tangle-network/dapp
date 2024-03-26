import { BN_ZERO } from '@polkadot/util';
import { useMemo } from 'react';

import { SubstrateLockId } from '../../constants';
import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';
import getSubstrateLockId from '../../utils/getSubstrateLockId';

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
      amount: targetLock?.amount.toBn() ?? BN_ZERO,
      reasons: targetLock?.reasons ?? null,
    };
  }, [lockId, locks]);

  return amountAndReasons;
};

export default useBalancesLock;
