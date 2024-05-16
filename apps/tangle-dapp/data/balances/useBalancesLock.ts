import { PalletBalancesReasons } from '@polkadot/types/lookup';
import { BN, BN_ZERO } from '@polkadot/util';
import { useCallback, useMemo } from 'react';

import { SubstrateLockId } from '../../constants';
import useApiRx from '../../hooks/useApiRx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import getSubstrateLockId from '../../utils/getSubstrateLockId';

export type BalancesLock = {
  amount: BN | null;
  reasons: PalletBalancesReasons | null;
};

const useBalancesLock = (lockId: SubstrateLockId): BalancesLock => {
  const activeSubstrateAddress = useSubstrateAddress();

  const { result: locks } = useApiRx(
    useCallback(
      (api) => {
        if (activeSubstrateAddress === null) {
          return null;
        }

        return api.query.balances.locks(activeSubstrateAddress);
      },
      [activeSubstrateAddress]
    )
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
