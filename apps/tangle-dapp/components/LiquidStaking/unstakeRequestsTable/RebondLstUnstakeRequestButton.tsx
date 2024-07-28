import { Button } from '@webb-tools/webb-ui-components';
import assert from 'assert';
import { FC, useCallback, useEffect, useState } from 'react';

import useLstRebondTx from '../../../data/liquidStaking/useLstRebondTx';
import { TxStatus } from '../../../hooks/useSubstrateTx';
import CancelUnstakeModal from './CancelUnstakeModal';

export type RebondLstUnstakeRequestButtonProps = {
  isDisabled: boolean;
  unlockIds: Set<number>;
};

const RebondLstUnstakeRequestButton: FC<RebondLstUnstakeRequestButtonProps> = ({
  isDisabled,
  unlockIds,
}) => {
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const { execute: executeRebondTx, status: rebondTxStatus } = useLstRebondTx();

  // Show the confirmation modal when the transaction is successful.
  useEffect(() => {
    if (rebondTxStatus === TxStatus.COMPLETE) {
      setIsConfirmationModalOpen(true);
    }
  }, [rebondTxStatus]);

  const handleConfirmation = useCallback(() => {
    // The button should have been disabled if this was null.
    assert(
      executeRebondTx !== null,
      'Execute function should be defined if this callback was called',
    );

    // TODO: Provide the actual currencies, will likely need to be pegged with each provided unlock id.
    executeRebondTx({ currency: 'Bnc', unlockIds: Array.from(unlockIds) });
  }, [executeRebondTx, unlockIds]);

  return (
    <>
      <Button
        variant="secondary"
        isDisabled={isDisabled || executeRebondTx === null}
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
