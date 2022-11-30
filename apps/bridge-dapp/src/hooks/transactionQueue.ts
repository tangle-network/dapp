import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  TransactionItemStatus,
  TransactionPayload,
} from '@webb-tools/webb-ui-components';
import {
  Transaction,
  TransactionState,
  TransactionStatusValue,
} from '@webb-tools/abstract-api-provider';

function transactionItemStatusFromTxStatus<Key extends TransactionState>(
  txStatus: TransactionState
): TransactionItemStatus {
  switch (txStatus) {
    case TransactionState.Done:
    case TransactionState.Ideal:
      return 'completed';
    case TransactionState.Failed:
      return 'warning';
    default:
      return 'in-progress';
  }
}
function getTxMessageFromStatus<Key extends TransactionState>(
  txStatus: Key,
  transactionStatusValue: TransactionStatusValue<Key>
): string {
  switch (txStatus) {
    case TransactionState.Cancelling:
      return 'Canceling the Transaction';
    case TransactionState.Ideal:
      return 'Transaction completed';
    case TransactionState.FetchingFixtures:
      return "Fetching the transaction's fixtures";
    case TransactionState.FetchingLeaves:
      return "Fetching the transaction's eaves";
    case TransactionState.GeneratingZk:
      return 'Generating the zero knowledge proof';
    case TransactionState.SendingTransaction:
      return 'Sending the transaction';
    case TransactionState.Intermediate:
      return `${transactionStatusValue.name}`;
    case TransactionState.Done:
      return 'Transaction completed';
    case TransactionState.Failed:
      return 'Transaction Failed';
  }
  return '';
}

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
    const txPayloads = txQueue.map((tx): TransactionPayload => {
      const [txStatus, data] = tx.currentStatus;
      return {
        id: tx.id,
        txStatus: {
          status: transactionItemStatusFromTxStatus(txStatus),
          message: getTxMessageFromStatus(txStatus, data),
          txHash: tx.txHash,
        },
        amount: tx.amount,
        method: tx.name,
      };
    });
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
