import { BN } from '@polkadot/util';
import { useMemo } from 'react';

import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import Optional from '../../utils/Optional';
import useRestakingRoleLedger from './useRestakingRoleLedger';

const useSharedRestakeAmount = () => {
  const activeSubstrateAccount = useSubstrateAddress();
  const ledgerResult = useRestakingRoleLedger(activeSubstrateAccount);
  const ledgerOpt = ledgerResult.data;
  const isLedgerAvailable = ledgerOpt !== null && ledgerOpt.isSome;

  const sharedRestakeAmount = useMemo<Optional<BN> | null>(() => {
    // If the ledger is loading or not available, return early.
    if (ledgerResult.isLoading || !isLedgerAvailable) {
      return null;
    }

    // At this point, we know that the ledger is available;
    // it is safe to unwrap the value.
    const ledger = ledgerOpt.unwrap();

    // Only shared profile types have a restake amount.
    return ledger.profile.isShared
      ? new Optional(ledger.profile.asShared.amount.toBn())
      : new Optional();
  }, [isLedgerAvailable, ledgerOpt, ledgerResult.isLoading]);

  return { sharedRestakeAmount, isLoading: ledgerResult.isLoading };
};

export default useSharedRestakeAmount;
