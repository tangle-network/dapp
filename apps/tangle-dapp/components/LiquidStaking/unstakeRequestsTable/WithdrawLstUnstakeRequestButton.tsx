import { Button } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

export type WithdrawLstUnstakeRequestButtonProps = {
  canWithdraw: boolean;
  unlockIds: Set<number>;
};

const WithdrawLstUnstakeRequestButton: FC<
  WithdrawLstUnstakeRequestButtonProps
> = ({ canWithdraw, unlockIds }) => {
  // TODO: On click, call `withdraw_redeemed` extrinsic and provide it with the `unlockIds` via batching.

  // TODO: Add and handle confirmation modal.
  return (
    <Button
      variant="secondary"
      isDisabled={!canWithdraw}
      onClick={() => void 0}
      isFullWidth
    >
      Withdraw
    </Button>
  );
};

export default WithdrawLstUnstakeRequestButton;
