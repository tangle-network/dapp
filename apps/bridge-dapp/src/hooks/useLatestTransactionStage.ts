import { TransactionState } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { useEffect, useState } from 'react';

export const useLatestTransactionStage = (transactionId: string) => {
  const [stage, setStage] = useState<TransactionState>(TransactionState.Ideal);

  const {
    txQueue: { txQueue },
  } = useWebContext();

  // Effect to subscribe to the latest tx and update the stage
  useEffect(() => {
    const tx = txQueue.find((tx) => tx.id === transactionId);
    if (!tx) {
      return;
    }

    const sub = tx.$currentStatus.subscribe(([status]) => {
      setStage(status);
    });

    return () => {
      sub.unsubscribe();
    };
  }, [transactionId, txQueue]);

  return stage;
};
