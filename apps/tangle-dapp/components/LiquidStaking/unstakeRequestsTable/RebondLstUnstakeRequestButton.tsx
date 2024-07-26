import { Button } from '@webb-tools/webb-ui-components';
import assert from 'assert';
import { FC, useCallback } from 'react';

import useLstRebondTx from '../../../data/liquidStaking/useLstRebondTx';
import CancelUnstakeModal from '../CancelUnstakeModal';

export type RebondLstUnstakeRequestButtonProps = {
  canRebond: boolean;
  unlockIds: Set<number>;
};

const RebondLstUnstakeRequestButton: FC<RebondLstUnstakeRequestButtonProps> = ({
  canRebond,
  unlockIds,
}) => {
  // TODO: On click, call `withdraw_redeemed` extrinsic and provide it with the `unlockIds` via batching.

  const { execute } = useLstRebondTx();

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

      {/* TODO: Handle modal. */}
      <CancelUnstakeModal
        isOpen={false}
        onClose={() => void 0}
        unstakeRequest={null as any}
      />
    </>
  );
};

export default RebondLstUnstakeRequestButton;
