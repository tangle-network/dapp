import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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

function transactionItemStatusFromTxStatus<Key extends TransactionState>(
  txStatus: TransactionState
): TransactionItemStatus {
  switch (txStatus) {
    case TransactionState.Done:
      return 'completed';
    case TransactionState.Ideal:
      return 'in-progress';
    case TransactionState.Failed:
      return 'warning';
    default:
      return 'in-progress';
  }
}
function mapTxToPayload(
  tx: Transaction<any>,
  dismissTransaction: (id: string) => void
): TransactionPayload {
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
      return dismissTransaction(tx.id);
    },

    method: tx.name as any,
  };
}
function getTxMessageFromStatus<Key extends TransactionState>(
  txStatus: Key,
  transactionStatusValue: TransactionStatusValue<Key>
): string {
  switch (txStatus) {
    case TransactionState.Cancelling:
      return 'Canceling transaction';
    case TransactionState.Ideal:
      return 'Transaction completed';
    case TransactionState.FetchingFixtures:
      return 'Fetching transaction fixtures';
    case TransactionState.FetchingLeaves:
      return 'Fetching transaction leaves...';
    case TransactionState.GeneratingZk:
      return 'Generating zero knowledge proof...';
    case TransactionState.SendingTransaction:
      return 'Sending transaction...';
    case TransactionState.Intermediate:
      return `${transactionStatusValue.name}`;
    case TransactionState.Done:
      return 'Transaction completed';
    case TransactionState.Failed:
      return 'Transaction failed';
  }
  return '';
}
export type TransactionQueueApi = {
  txPayloads: TransactionPayload[];
  txQueue: Transaction<any>[];
  currentTxId: string | null;
  api: {
    cancelTransaction(id: string): void;
    dismissTransaction(id: string): void;
    registerTransaction(tx: Transaction<any>): void;
    startNewTransaction(): void;
  };
};
export function useTxApiQueue(): TransactionQueueApi {
  const [txQueue, setTxQueue] = useState<Transaction<any>[]>([]);
  const [transactionPayloads, setTxPayloads] = useState<TransactionPayload[]>(
    []
  );
  const subscriptions =
    useRef<Map<string, Array<{ unsubscribe: () => void }>>>();
  const [mainTxId, setMainTxId] = useState<null | string>(null);
  useEffect(() => {
    subscriptions.current = new Map();
  }, []);
  /**
   * Action by the user to remove the transaction or Dismiss it
   *
   * */
  const dismissTransaction = useCallback(
    (id: string) => {
      setTxQueue((txQueue) => {
        return txQueue.filter((tx) => tx.id !== id);
      });
      if (subscriptions.current?.has(id)) {
        subscriptions.current.get(id)?.forEach((sub) => {
          sub.unsubscribe();
        });
      }
    },
    [setTxQueue, subscriptions]
  );

  const registerTransaction = useCallback(
    (tx: Transaction<any>) => {
      setMainTxId(tx.id);
      setTxQueue((queue) => {
        const next = [...queue, tx];
        setTxPayloads(next.map((tx) => mapTxToPayload(tx, dismissTransaction)));
        return [...queue, tx];
      });
      const sub = tx.$currentStatus.subscribe((updatedStatus) => {
        setTxPayloads((txPayloads) => {
          return txPayloads.map((txPayload) => {
            if (txPayload.id !== tx.id) {
              return txPayload;
            }
            const [txStatus, data] = updatedStatus;
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
      });
      const txHashSub = tx.$txHash.subscribe((txHash) => {
        setTxPayloads((txPayloads) => {
          return txPayloads.map((txPayload) => {
            if (txPayload.id !== tx.id) {
              return txPayload;
            }
            return {
              ...txPayload,
              txStatus: {
                ...txPayload.txStatus,
                txHash,
              },
            };
          });
        });
      });
      subscriptions.current?.set(tx.id, [sub, txHashSub]);
    },
    [
      setTxQueue,
      setTxPayloads,
      subscriptions,
      txQueue,
      transactionPayloads,
      dismissTransaction,
    ]
  );
  const cancelTransaction = useCallback(
    (id: string) => {
      const tx = txQueue.find((tx) => tx.id === id);
      tx?.cancel();
    },
    [txQueue]
  );

  useEffect(() => {
    setTxPayloads(txQueue.map((tx) => mapTxToPayload(tx, dismissTransaction)));
  }, [txQueue, dismissTransaction]);
  const startNewTransaction = useCallback(() => {
    setMainTxId(null);
  }, [setMainTxId]);

  return useMemo(
    () => ({
      txQueue,
      txPayloads: transactionPayloads,
      currentTxId: mainTxId,
      api: {
        cancelTransaction,
        dismissTransaction,
        registerTransaction,
        startNewTransaction,
      },
    }),
    [
      mainTxId,
      transactionPayloads,
      txQueue,
      registerTransaction,
      dismissTransaction,
      cancelTransaction,
    ]
  );
}
