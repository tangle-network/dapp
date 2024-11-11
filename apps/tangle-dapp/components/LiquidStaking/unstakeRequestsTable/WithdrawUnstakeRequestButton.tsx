import { ArrowRight } from '@webb-tools/icons';
import { Button } from '@webb-tools/webb-ui-components';
import { FC, useCallback } from 'react';
import useLsWithdrawUnbondedTx from '../../../data/liquidStaking/useLsWithdrawUnbondedTx';
import { TxStatus } from '../../../hooks/useSubstrateTx';

export type WithdrawUnstakeRequestButtonProps = {
  lsPoolId: number;
};

const WithdrawUnstakeRequestButton: FC<WithdrawUnstakeRequestButtonProps> = ({
  lsPoolId,
}) => {
  const { status, execute } = useLsWithdrawUnbondedTx();

  const isReady = execute !== null && status !== TxStatus.PROCESSING;

  const handleConfirmClick = useCallback(async () => {
    if (!isReady) {
      return;
    }

    // TODO: Slashing spans.
    await execute({ poolId: lsPoolId, slashingSpans: 0 });
  }, [isReady]);

  return (
    <Button
      isDisabled={!isReady}
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
