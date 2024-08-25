import { Button } from '@webb-tools/webb-ui-components';
import { FC, useCallback } from 'react';

import { LsErc20TokenId } from '../../../constants/liquidStaking/types';
import useLiquifierWithdraw from '../../../data/liquifier/useLiquifierWithdraw';

type WithdrawUnlockNftButtonProps = {
  tokenId: LsErc20TokenId;
  canWithdraw: boolean;
  unlockIds: number[];
};

const WithdrawUnlockNftButton: FC<WithdrawUnlockNftButtonProps> = ({
  tokenId,
  canWithdraw,
  unlockIds,
}) => {
  const withdraw = useLiquifierWithdraw();

  const handleClick = useCallback(() => {
    if (withdraw === null) {
      return;
    }

    for (const unlockId of unlockIds) {
      withdraw(tokenId, unlockId);
    }
  }, [tokenId, unlockIds, withdraw]);

  return (
    <Button
      variant="secondary"
      isDisabled={!canWithdraw || unlockIds.length === 0 || withdraw === null}
      onClick={handleClick}
      isFullWidth
    >
      Withdraw
    </Button>
  );
};

export default WithdrawUnlockNftButton;
