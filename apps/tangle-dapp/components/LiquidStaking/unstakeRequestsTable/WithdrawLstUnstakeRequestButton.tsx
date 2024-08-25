import { Button } from '@webb-tools/webb-ui-components';
import assert from 'assert';
import { FC, useCallback, useEffect, useState } from 'react';

import { ParachainCurrency } from '../../../constants/liquidStaking/types';
import useLstWithdrawRedeemTx from '../../../data/liquidStaking/useLstWithdrawRedeemTx';
import { TxStatus } from '../../../hooks/useSubstrateTx';
import WithdrawalConfirmationModal from './WithdrawalConfirmationModal';

export type WithdrawLstUnstakeRequestButtonProps = {
  canWithdraw: boolean;
  currenciesAndUnlockIds: [ParachainCurrency, number][];
};

const WithdrawLstUnstakeRequestButton: FC<
  WithdrawLstUnstakeRequestButtonProps
> = ({ canWithdraw, currenciesAndUnlockIds }) => {
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const {
    execute: executeWithdrawRedeemTx,
    status: withdrawRedeemTxStatus,
    txHash: withdrawRedeemTxHash,
  } = useLstWithdrawRedeemTx();

  // Show the confirmation modal when the transaction is successful.
  useEffect(() => {
    if (withdrawRedeemTxStatus === TxStatus.COMPLETE) {
      setIsConfirmationModalOpen(true);
    }
  }, [withdrawRedeemTxStatus]);

  const handleClick = useCallback(() => {
    // The button should have been disabled if this was null.
    assert(
      executeWithdrawRedeemTx !== null,
      'Execute function should be defined if this callback was called',
    );

    executeWithdrawRedeemTx({ currenciesAndUnlockIds });
  }, [executeWithdrawRedeemTx, currenciesAndUnlockIds]);

  return (
    <>
      <Button
        variant="secondary"
        isDisabled={
          !canWithdraw ||
          executeWithdrawRedeemTx === null ||
          currenciesAndUnlockIds.length === 0
        }
        onClick={handleClick}
        isFullWidth
      >
        Withdraw
      </Button>

      <WithdrawalConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        txHash={withdrawRedeemTxHash}
      />
    </>
  );
};

export default WithdrawLstUnstakeRequestButton;
