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
import { TokenIcon } from '@webb-tools/icons';
import { zip } from 'rxjs';

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
      const { amount, wallets, token, tokens } = tx.metaData;
      return {
        id: tx.id,
        txStatus: {
          status: transactionItemStatusFromTxStatus(txStatus),
          message: getTxMessageFromStatus(txStatus, data),
          txHash: tx.txHash,
        },
        amount: String(amount),
        getExplorerURI(addOrTxHash: string, variant: 'tx' | 'address'): string {
          return `https://explorer.moonbeam.network/${variant}/${addOrTxHash}`;
        },
        timestamp: tx.timestamp,
        token,
        tokens: tokens,
        wallets: {
          src: <TokenIcon size={'lg'} name={wallets.src || 'default'} />,
          dist: <TokenIcon size={'lg'} name={wallets.dist || 'default'} />,
        },
        onDismiss(): void {
          return;
        },

        method: tx.name as any,
      };
    });
    setTxPayloads(txPayloads);
    const subscribe = zip(txQueue.map((i) => i.$currentStatus)).subscribe(
      (updatedStatus) => {
        setTxPayloads((txPayloads) => {
          return txPayloads.map((txPayload, index) => {
            const [txStatus, data] = updatedStatus[index];
            return {
              ...txPayload,
              txStatus: {
                ...txPayload.txStatus,
                status: transactionItemStatusFromTxStatus(txStatus),
                message: getTxMessageFromStatus(txStatus, data),
              },
            };
          });
        });
      }
    );
    return () => subscribe.unsubscribe();
  }, [txQueue, setTxPayloads]);

  const api = useMemo(
    () => ({
      cancelTransaction,
      dismissTransaction,
      registerTransaction,
    }),
    [registerTransaction, dismissTransaction, cancelTransaction]
  );
  console.log(transactionPayloads, 'transactionPayloads');
  return [transactionPayloads, api];
}
