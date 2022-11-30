import { useCallback, useEffect, useMemo, useState } from 'react';
import { TransactionPayload } from '@webb-tools/webb-ui-components';
import { Transaction } from '@webb-tools/abstract-api-provider';

export function useTxQueue() {
  const [txQueue, setTxQueue] = useState<Transaction<any>[]>([]);
  const [transactionPayloads, setTxPayloads] = useState<TransactionPayload[]>(
    []
  );

  /**
   * Action by the user to remove the transaction or Dismiss it
   *
   * */
  const dismissTransaction = useCallback(
    (id: string) => {
      setTxQueue((txQueue) => {
        return txQueue.filter((tx) => tx.id !== id);
      });
    },
    [setTxQueue]
  );

  const registerTransaction = useCallback(
    (tx: Transaction<any>) => {
      setTxQueue((queue) => [...queue, tx]);
    },
    [setTxQueue]
  );
  const cancelTransaction = useCallback(
    (id: string) => {
      const tx = txQueue.find((tx) => tx.id === id);
      tx?.cancel();
    },
    [txQueue]
  );
  useEffect(() => {
    const txPayloads = txQueue.map(
      (tx): TransactionPayload => ({
        id: tx.id,
        txStatus: {
          status: tx.status[0],
          message:tx
        },
      })
    );
  }, [txQueue, setTxPayloads]);

  const api = useMemo(
    () => ({
      cancelTransaction,
      dismissTransaction,
      registerTransaction,
    }),
    [registerTransaction, dismissTransaction, cancelTransaction]
  );

  return [transactionPayloads, api];
}
