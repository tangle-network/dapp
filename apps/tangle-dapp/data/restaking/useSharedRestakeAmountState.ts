import { BN } from '@polkadot/util';
import { useCallback, useEffect, useState } from 'react';

import useRestakingRoleLedger from './useRestakingRoleLedger';

const useSharedRestakeAmountState = () => {
  const ledgerResult = useRestakingRoleLedger();
  const ledgerOpt = ledgerResult.data;
  const isLedgerAvailable = ledgerOpt !== null && ledgerOpt.isSome;

  const [sharedRestakeAmount, setSharedRestakeAmount] = useState<BN | null>(
    null
  );

  useEffect(() => {
    if (ledgerResult.isLoading || !isLedgerAvailable) {
      return;
    }

    const ledger = ledgerOpt.unwrap();

    if (ledger.profile.isShared) {
      setSharedRestakeAmount(ledger.profile.asShared.amount.toBn());
    }
  }, [isLedgerAvailable, ledgerOpt, ledgerResult.isLoading]);

  const reset = useCallback(() => {
    if (!isLedgerAvailable) {
      return;
    }

    const ledger = ledgerOpt.unwrap();

    if (ledger.profile.isShared) {
      setSharedRestakeAmount(ledger.profile.asShared.amount.toBn());
    }
  }, [isLedgerAvailable, ledgerOpt]);

  return {
    sharedRestakeAmount,
    setSharedRestakeAmount,
    isLoading: ledgerResult.isLoading,
    reset,
  };
};

export default useSharedRestakeAmountState;
