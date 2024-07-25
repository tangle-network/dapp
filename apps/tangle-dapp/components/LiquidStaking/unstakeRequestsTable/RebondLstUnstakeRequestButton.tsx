import { Close } from '@webb-tools/icons';
import { FC } from 'react';

import UtilityIconButton from './UtilityIconButton';

export type RebondLstUnstakeRequestButtonProps = {
  canRebond: boolean;
  unlockId: number;
};

const RebondLstUnstakeRequestButton: FC<RebondLstUnstakeRequestButtonProps> = ({
  canRebond,
  unlockId,
}) => {
  // TODO: On click, call `withdraw_redeemed` extrinsic and provide it with the `unlockId`.

  return (
    <UtilityIconButton
      isDisabled={!canRebond}
      Icon={Close}
      tooltip="Cancel"
      onClick={() => void 0}
    />
  );
};

export default RebondLstUnstakeRequestButton;
