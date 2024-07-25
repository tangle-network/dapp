import { WalletLineIcon } from '@webb-tools/icons';
import { FC } from 'react';

import UtilityIconButton from './UtilityIconButton';

export type WithdrawLstUnstakeRequestButtonProps = {
  canWithdraw: boolean;
  unlockId: number;
};

const WithdrawLstUnstakeRequestButton: FC<
  WithdrawLstUnstakeRequestButtonProps
> = ({ canWithdraw, unlockId }) => {
  // TODO: On click, call `withdraw_redeemed` extrinsic and provide it with the `unlockId`.

  return (
    <UtilityIconButton
      isDisabled={!canWithdraw}
      Icon={WalletLineIcon}
      tooltip="Withdraw"
      onClick={() => void 0}
    />
  );
};

export default WithdrawLstUnstakeRequestButton;
