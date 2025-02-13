import { ArrowRight } from '@tangle-network/icons';
import { Button } from '@tangle-network/webb-ui-components';
import { FC, useCallback } from 'react';

import useLsWithdrawUnbondedTx from '../../data/liquidStaking/useLsWithdrawUnbondedTx';
import { TxStatus } from '../../hooks/useSubstrateTx';

export type WithdrawUnstakeRequestButtonProps = {
  lsPoolId: number;
  isReadyToWithdraw: boolean;
};

const WithdrawUnstakeRequestButton: FC<WithdrawUnstakeRequestButtonProps> = ({
  lsPoolId,
  isReadyToWithdraw,
}) => {
  const { status, execute } = useLsWithdrawUnbondedTx();

  const isReady = execute !== null && status !== TxStatus.PROCESSING;

  const handleConfirmClick = useCallback(async () => {
    if (!isReady) {
      return;
    }

    // TODO: Slashing spans.
    await execute({ poolId: lsPoolId, slashingSpans: 0 });
  }, [execute, isReady, lsPoolId]);

  return (
    <Button
      isDisabled={!isReady || !isReadyToWithdraw}
      onClick={handleConfirmClick}
      rightIcon={<ArrowRight className="fill-current dark:fill-current" />}
      variant="utility"
      size="sm"
    >
      Withdraw
    </Button>
  );
};

export default WithdrawUnstakeRequestButton;
