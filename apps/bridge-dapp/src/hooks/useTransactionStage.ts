import {
  useBridgeDeposit,
  useTransfer,
  useWithdraw,
} from '@webb-tools/react-hooks';

/**
 * Get the stage and setStage for a transaction, make use inside the transaction processing component
 * @param method The method to use for the transaction
 * @returns the stage and setStage function
 */
export const useTransactionStage = (
  method: 'Deposit' | 'Withdraw' | 'Transfer' = 'Deposit'
) => {
  const { stage: depositStage, setStage: setDepositStage } = useBridgeDeposit();

  const { stage: withdrawStage, setStage: setWithdrawStage } = useWithdraw({
    notes: null,
    recipient: '',
    amount: 0,
  });

  const { stage: transferStage, setStage: setTransferStage } = useTransfer({
    notes: [],
    amount: 0,
    recipient: '',
    destination: undefined,
  });
  switch (method) {
    case 'Deposit':
      return { stage: depositStage, setStage: setDepositStage };
    case 'Withdraw':
      return { stage: withdrawStage, setStage: setWithdrawStage };
    case 'Transfer':
      return { stage: transferStage, setStage: setTransferStage };
    default:
      return { stage: depositStage, setStage: setDepositStage };
  }
};
