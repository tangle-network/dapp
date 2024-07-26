import { Button } from '@webb-tools/webb-ui-components';
import assert from 'assert';
import { FC, useCallback, useEffect, useState } from 'react';

import useLstRebondTx from '../../../data/liquidStaking/useLstRebondTx';
import { TxStatus } from '../../../hooks/useSubstrateTx';
import CancelUnstakeModal from '../CancelUnstakeModal';

export type RebondLstUnstakeRequestButtonProps = {
  canRebond: boolean;
  unlockIds: Set<number>;
};

const RebondLstUnstakeRequestButton: FC<RebondLstUnstakeRequestButtonProps> = ({
  canRebond,
  unlockIds,
}) => {
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const { execute, status } = useLstRebondTx();

  // Show the confirmation modal when the transaction is successful.
  useEffect(() => {
    if (status === TxStatus.COMPLETE) {
      setIsConfirmationModalOpen(true);
    }
  }, [status]);

  const handleRebondClick = useCallback(() => {
    // The button should have been disabled if this was null.
    assert(
      execute !== null,
      'Execute function should be defined if this callback was called',
    );

    // TODO: Provide the actual currencies, will likely need to be pegged with each provided unlock id.
    execute({ currency: 'Bnc', unlockIds: Array.from(unlockIds) });
  }, [execute, unlockIds]);

  return (
    <>
      <Button
        variant="secondary"
        isDisabled={!canRebond || execute === null}
        onClick={handleRebondClick}
        isFullWidth
      >
        Cancel Unstake
      </Button>

      <CancelUnstakeModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        // TODO: Picking the first value temporarily. Figure out how the modal will work with multiple unlock ids.
        unlockId={unlockIds.values().next().value}
      />
    </>
  );
};

export default RebondLstUnstakeRequestButton;
