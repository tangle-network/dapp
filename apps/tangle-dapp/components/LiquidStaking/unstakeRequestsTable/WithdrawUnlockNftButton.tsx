import { Button } from '@webb-tools/webb-ui-components';
import { FC, useCallback, useState } from 'react';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const withdraw = useLiquifierWithdraw();

  const handleClick = useCallback(async () => {
    if (withdraw === null) {
      return;
    }

    setIsProcessing(true);

    for (const [index, unlockId] of unlockIds.entries()) {
      const success = await withdraw(tokenId, unlockId, {
        current: index + 1,
        total: unlockIds.length,
      });

      if (!success) {
        console.error(
          'Liquifier withdraw batch was aborted because one request failed',
        );

        break;
      }
    }

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
