import { Button } from '@webb-tools/webb-ui-components';
import assert from 'assert';
import { FC, useCallback, useEffect, useState } from 'react';

import { ParachainCurrency } from '../../../constants/liquidStaking/types';
import useLstRebondTx from '../../../data/liquidStaking/useLstRebondTx';
import { TxStatus } from '../../../hooks/useSubstrateTx';
import CancelUnstakeModal from './CancelUnstakeModal';

export type RebondLstUnstakeRequestButtonProps = {
  isDisabled: boolean;
  currenciesAndUnlockIds: [ParachainCurrency, number][];
};

const RebondLstUnstakeRequestButton: FC<RebondLstUnstakeRequestButtonProps> = ({
  isDisabled,
  currenciesAndUnlockIds,
}) => {
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const { execute: executeRebondTx, status: rebondTxStatus } = useLstRebondTx();

  // Close the confirmation modal when the transaction is successful.
  useEffect(() => {
    if (rebondTxStatus === TxStatus.COMPLETE) {
      setIsConfirmationModalOpen(false);
    }
  }, [rebondTxStatus]);

  const handleConfirmation = useCallback(() => {
    // The button should have been disabled if this was null.
    assert(
      executeRebondTx !== null,
      'Execute function should be defined if this callback was called',
    );

    executeRebondTx({ currenciesAndUnlockIds });
  }, [executeRebondTx, currenciesAndUnlockIds]);

  return (
    <>
      <Button
        variant="secondary"
        isDisabled={
          isDisabled ||
          executeRebondTx === null ||
          currenciesAndUnlockIds.length === 0
        }
        onClick={() => setIsConfirmationModalOpen(true)}
        isFullWidth
      >
        Cancel Unstake
      </Button>

      <CancelUnstakeModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={handleConfirmation}
        txStatus={rebondTxStatus}
      />
    </>
  );
};

export default RebondLstUnstakeRequestButton;
