import {
  NewNotesTxResult,
  Transaction,
  TransactionState,
  TransactionStatusValue,
} from '@webb-tools/abstract-api-provider';
import {
  ApiConfig,
  ChainConfig,
  CurrencyConfig,
} from '@webb-tools/dapp-config';
import { ChainIcon } from '@webb-tools/icons';
import {
  TransactionItemStatus,
  TransactionPayload,
  getRoundedAmountString,
} from '@webb-tools/webb-ui-components';
import { useObservableState } from 'observable-hooks';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BehaviorSubject } from 'rxjs';

function transactionItemStatusFromTxStatus(
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
  chainConfig: Record<number, ChainConfig>,
  dismissTransaction: (id: string) => void
): TransactionPayload {
  const [txStatus, data] = tx.currentStatus;
  const { amount, wallets, token, tokens, tokenURI } = tx.metaData;

  let explorerUri = '';

  if (tx.name === 'Deposit') {
    explorerUri = chainConfig[wallets.src]?.blockExplorerStub ?? '';
  } else {
    explorerUri = chainConfig[wallets.dest]?.blockExplorerStub ?? '';
  }

  const srcChainName = chainConfig[wallets.src]?.name;
  const destChainName = chainConfig[wallets.dest]?.name;

  const txProviderType = tx.metaData.providerType;

  const getExplorerURI = (
    addOrTxHash: string,
    variant: 'tx' | 'address'
  ): string => {
    explorerUri = explorerUri.endsWith('/') ? explorerUri : explorerUri + '/';

    switch (txProviderType) {
      case 'web3':
        return `${explorerUri}${variant}/${addOrTxHash}`;

      case 'polkadot': {
        const prefix = variant === 'tx' ? `explorer/query/${addOrTxHash}` : '';
        return `${explorerUri}${prefix}`;
      }

      default:
        return '';
    }
  };

  return {
    id: tx.id,
    txStatus: {
      status: transactionItemStatusFromTxStatus(txStatus),
      message: getTxMessageFromStatus(txStatus, data),
      txHash: tx.txHash,
      recipient: tx.metaData.recipient,
    },
    amount: getRoundedAmountString(amount),
    getExplorerURI,
    timestamp: tx.timestamp,
    token,
    tokenURI,
    tokens: tokens,
    wallets: {
      src: <ChainIcon name={srcChainName} />,
      dist: <ChainIcon name={destChainName} />,
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
      return 'Transaction in-progress';

    case TransactionState.PreparingTransaction:
      return 'Preparing transaction';

    case TransactionState.FetchingFixtures:
      return 'Fetching transaction fixtures';

    case TransactionState.FetchingLeavesFromRelayer:
      return 'Fetching transaction leaves from the relayer...';

    case TransactionState.ValidatingLeaves: {
      const isValid = transactionStatusValue as undefined | boolean;
      return isValid === undefined
        ? 'Validating transaction leaves...'
        : isValid
        ? 'Transaction leaves are valid'
        : 'Transaction leaves are invalid';
    }

    case TransactionState.FetchingLeaves:
      return 'Fetching transaction leaves on chain...';

    case TransactionState.GeneratingZk:
      return 'Generating zero knowledge proof...';

    case TransactionState.InitializingTransaction:
      return 'Initializing transaction...';

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

    /**
     * Get the latest transaction of the given name
     * @param name The name of the transaction (Deposit, Withdraw, Transfer)
     * @returns The latest transaction of the given name or null if no transaction is found
     */
    getLatestTransaction(
      name: 'Deposit' | 'Withdraw' | 'Transfer'
    ): Transaction<NewNotesTxResult> | null;
  };
};

// The global transaction queue for the bridge dApp
const txQueue$ = new BehaviorSubject<Transaction<NewNotesTxResult>[]>([]);

const txPayloads$ = new BehaviorSubject<TransactionPayload[]>([]);

export function useTxApiQueue(apiConfig: ApiConfig): TransactionQueueApi {
  const { chains } = apiConfig;

  const subscriptions = useRef(
    new Map<string, Array<{ unsubscribe: () => void }>>()
  );

  const txQueue = useObservableState(txQueue$);

  const txPayloads = useObservableState(txPayloads$);

  const [mainTxId, setMainTxId] = useState<null | string>(null);

  /**
   * Action by the user to remove the transaction or Dismiss it
   *
   * */
  const dismissTransaction = useCallback(
    (id: string) => {
      const dismissTx = txQueue$.getValue().find((tx) => tx.id === id);
      if (!dismissTx) {
        return;
      }

      const nextTxQueue = txQueue$.getValue().filter((tx) => tx.id !== id);
      txQueue$.next(nextTxQueue);

      // Unsubscribe from the transaction
      if (subscriptions.current.has(id)) {
        subscriptions.current.get(id)?.forEach((sub) => {
          sub.unsubscribe();
        });
      }
    },
    [subscriptions]
  );

  const registerTransaction = useCallback(
    (tx: Transaction<NewNotesTxResult>) => {
      setMainTxId(tx.id);
      const currentTxQueue = txQueue$.getValue();
      txQueue$.next([...currentTxQueue, tx]);

      // Subscribe to the transaction status
      const statusSub = tx.$currentStatus.subscribe(
        async ([nextTxState, nextTxData]) => {
          if (nextTxState === TransactionState.Done) {
            // Update the tx hash
            const { txHash } = nextTxData as NewNotesTxResult;
            tx.txHash = txHash;
          }

          if (nextTxState === TransactionState.SendingTransaction) {
            // Update the tx hash
            tx.txHash = nextTxData as string;
          }

          const payloads = txPayloads$.getValue();

          const currentPayload = payloads.find(
            (payload) => payload.id === tx.id
          );
          if (!currentPayload) {
            return;
          }

          const nextStatus = transactionItemStatusFromTxStatus(nextTxState);
          const nextMessage = getTxMessageFromStatus(nextTxState, nextTxData);

          if (
            nextStatus === currentPayload.txStatus.status &&
            nextMessage === currentPayload.txStatus.message
          ) {
            return;
          }

          const nextPayloads = payloads.map((payload) => {
            if (payload.id === tx.id) {
              return {
                ...payload,
                txStatus: {
                  ...payload.txStatus,
                  status: nextStatus,
                  message: nextMessage,
                },
              };
            }
            return payload;
          });

          txPayloads$.next(nextPayloads);
        }
      );

      // Substart to the transaction hash
      const hashSub = tx.$txHash.subscribe((nextTxHash) => {
        const payloads = txPayloads$.getValue();
        const currentPayload = payloads.find((payload) => payload.id === tx.id);

        if (!currentPayload) {
          return;
        }

        if (nextTxHash === currentPayload.txStatus.txHash) {
          return;
        }

        const nextPayloads = payloads.map((payload) => {
          if (payload.id === tx.id) {
            return {
              ...payload,
              txStatus: {
                ...payload.txStatus,
                txHash: nextTxHash,
              },
            };
          }
          return payload;
        });

        txPayloads$.next(nextPayloads);
      });

      // Update the subscriptions ref
      subscriptions.current.set(tx.id, [statusSub, hashSub]);
    },
    []
  );

  const cancelTransaction = useCallback((id: string) => {
    const tx = txQueue$.getValue().find((tx) => tx.id === id);
    tx?.cancel();
  }, []);

  const startNewTransaction = useCallback(() => {
    setMainTxId(null);
  }, []);

  const getLatestTransaction = useCallback(
    (
      name: 'Deposit' | 'Withdraw' | 'Transfer'
    ): Transaction<NewNotesTxResult> | null => {
      const txes = txQueue$.getValue().filter((tx) => tx.name === name);
      if (txes.length === 0) {
        return null;
      }
      return txes[txes.length - 1];
    },
    []
  );

  // Effect to subscribe to the txQueue and update the txPayloads
  useEffect(() => {
    const sub = txQueue$.subscribe((txQueue) => {
      const nextPayloads = txQueue.map((tx) => {
        return mapTxToPayload(tx, chains, dismissTransaction);
      });

      txPayloads$.next(nextPayloads);
    });

    return () => {
      sub.unsubscribe();
    };
  }, [chains, dismissTransaction]);

  return {
    txQueue,
    txPayloads,
    currentTxId: mainTxId,
    api: {
      cancelTransaction,
      dismissTransaction,
      registerTransaction,
      startNewTransaction,
      getLatestTransaction,
    },
  };
}
