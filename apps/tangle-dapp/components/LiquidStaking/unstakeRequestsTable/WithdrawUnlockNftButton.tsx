import { Button } from '@webb-tools/webb-ui-components';
import { FC, useCallback, useState } from 'react';

import { LsLiquifierProtocolId } from '../../../constants/liquidStaking/types';
import useLiquifierWithdraw from '../../../data/liquifier/useLiquifierWithdraw';

type WithdrawUnlockNftButtonProps = {
  tokenId: LsLiquifierProtocolId;
  canWithdraw: boolean;
  unlockIds: number[];
};

const WithdrawUnlockNftButton: FC<WithdrawUnlockNftButtonProps> = ({
  tokenId,
  canWithdraw,
  unlockIds,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const withdraw = useLiquifierWithdraw();

  const handleClick = useCallback(async () => {
    if (withdraw === null) {
      return;
    }

    setIsProcessing(true);
    await withdraw(tokenId, unlockIds);
    setIsProcessing(false);
  }, [tokenId, unlockIds, withdraw]);

  return (
    <Button
      variant="primary"
      isDisabled={!canWithdraw || unlockIds.length === 0 || withdraw === null}
      onClick={handleClick}
      isFullWidth
      isLoading={isProcessing}
      loadingText="Processing"
    >
      Withdraw
    </Button>
  );
};

export default WithdrawUnlockNftButton;
