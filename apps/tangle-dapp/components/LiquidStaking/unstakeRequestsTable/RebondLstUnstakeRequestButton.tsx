import { Button } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

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

  return (
    <>
      <Button
        variant="secondary"
        isDisabled={!canRebond}
        onClick={() => void 0}
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
