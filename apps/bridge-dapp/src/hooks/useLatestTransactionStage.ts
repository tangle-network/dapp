import { TransactionState } from '@webb-tools/abstract-api-provider';
import { useTxQueue } from '@webb-tools/react-hooks';
import { useEffect, useState } from 'react';

export const useLatestTransactionStage = (
  transactionType: 'Deposit' | 'Withdraw' | 'Transfer'
) => {
  const [stage, setStage] = useState<TransactionState>(TransactionState.Ideal);

  const {
    api: { getLatestTransaction },
  } = useTxQueue();

  // Effect to subscribe to the latest tx and update the stage
  useEffect(() => {
    const tx = getLatestTransaction(transactionType);
    if (!tx) {
      return;
    }

    const sub = tx.$currentStatus.subscribe(([status]) => {
      setStage(status);
    });

    return () => {
      sub.unsubscribe();
    };
  }, [getLatestTransaction, transactionType]);

  return stage;
};
