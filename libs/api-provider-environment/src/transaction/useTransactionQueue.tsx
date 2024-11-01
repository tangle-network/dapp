'use client';

import {
  NewNotesTxResult,
  TransactionExecutor,
  TransactionState,
  TransactionStatusMap,
  TransactionStatusValue,
  TransactionName,
} from '@webb-tools/abstract-api-provider/transaction';
import calculateProgressPercentage from '@webb-tools/abstract-api-provider/utils/calculateProgressPercentage';
import { ApiConfig, ChainConfig } from '@webb-tools/dapp-config';
import { ChainIcon } from '@webb-tools/icons';
import {
  TransactionItemStatus,
  TransactionPayload,
  getRoundedAmountString,
  toFixed,
} from '@webb-tools/webb-ui-components';
import { useObservableState } from 'observable-hooks';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BehaviorSubject } from 'rxjs';
import { getExplorerUrl } from './utils';

export function transactionItemStatusFromTxStatus(
  txStatus: TransactionState,
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
  tx: TransactionExecutor<any>,
  chainConfig: Record<number, ChainConfig>,
  dismissTransaction: (id: string) => void,
): TransactionPayload {
  const [txStatus, data] = tx.currentStatus;
  const { amount, wallets, token, tokens, tokenURI } = tx.metaData;

  let explorerUri = '';

  if (tx.name === 'Deposit') {
    explorerUri = chainConfig[wallets.src]?.blockExplorers?.default.url ?? '';
  } else {
    explorerUri = chainConfig[wallets.dest]?.blockExplorers?.default.url ?? '';
  }

  const srcChainName = chainConfig[wallets.src]?.name;
  const destChainName = chainConfig[wallets.dest]?.name;

  const txProviderType = tx.metaData.providerType;
  const currentStep = tx.stepSubject.getValue();

  return {
    id: tx.id,
    txStatus: {
      status: transactionItemStatusFromTxStatus(txStatus),
      message: getTxMessageFromStatus(txStatus, data),
      txHash: tx.txHash,
      recipient: tx.metaData.recipient,
    },
    currentStep,
    amount: getRoundedAmountString(amount),
    getExplorerURI: (addOrTxHash: string, variant: 'tx' | 'address') =>
      getExplorerUrl(
        explorerUri,
        addOrTxHash,
        variant,
        txProviderType,
      ).toString(),
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

export function getTxMessageFromStatus<Key extends TransactionState>(
  txStatus: Key,
  transactionStatusValue: TransactionStatusValue<Key>,
): string {
  switch (txStatus) {
    case TransactionState.Cancelling:
      return 'Canceling transaction';

    case TransactionState.Ideal:
      return 'Transaction in-progress';

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
  txQueue: TransactionExecutor<any>[];
  currentTxId: string | null;
  api: {
    cancelTransaction(id: string): void;
    dismissTransaction(id: string): void;
    registerTransaction(tx: TransactionExecutor<any>): void;
    startNewTransaction(): void;

    /**
     * Get the latest transaction of the given name
     * @param name The name of the transaction (Deposit, Withdraw, Transfer)
     * @returns The latest transaction of the given name or null if no transaction is found
     */
    getLatestTransaction(
      name: TransactionName,
    ): TransactionExecutor<NewNotesTxResult> | null;
  };
};

// The global transaction queue for the bridge dApp
const txQueue$ = new BehaviorSubject<TransactionExecutor<NewNotesTxResult>[]>(
  [],
);

const txPayloads$ = new BehaviorSubject<TransactionPayload[]>([]);

export function useTxApiQueue(apiConfig: ApiConfig): TransactionQueueApi {
  const { chains } = apiConfig;

  const subscriptions = useRef(
    new Map<string, Array<{ unsubscribe: () => void }>>(),
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
    [subscriptions],
  );

  const registerTransaction = useCallback(
    (tx: TransactionExecutor<NewNotesTxResult>) => {
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
            (payload) => payload.id === tx.id,
          );
          if (!currentPayload) {
            return;
          }

          const nextStatus = transactionItemStatusFromTxStatus(nextTxState);
          let nextMessage = getTxMessageFromStatus(nextTxState, nextTxData);
          if (nextTxState === TransactionState.FetchingLeaves) {
            const { current, end, start } =
              nextTxData as TransactionStatusMap<unknown>[TransactionState.FetchingLeaves];

            const percentage = calculateProgressPercentage(start, end, current);
            const formattedPercentage = toFixed(percentage);
            nextMessage = `Fetching transaction leaves on chain... ${formattedPercentage}%`;
          }

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
        },
      );

      // Subscribe to the transaction hash
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

      // Subscribe to the transaction step
      const stepSub = tx.stepSubject.subscribe((nextStep) => {
        const payloads = txPayloads$.getValue();
        const currentPayload = payloads.find((payload) => payload.id === tx.id);

        if (!currentPayload) {
          return;
        }

        if (nextStep === currentPayload.currentStep) {
          return;
        }

        const nextPayloads = payloads.map((payload) => {
          if (payload.id === tx.id) {
            return {
              ...payload,
              currentStep: nextStep,
            };
          }
          return payload;
        });

        txPayloads$.next(nextPayloads);
      });

      // Update the subscriptions ref
      subscriptions.current.set(tx.id, [statusSub, hashSub, stepSub]);
    },
    [],
  );

  const cancelTransaction = useCallback((id: string) => {
    const tx = txQueue$.getValue().find((tx) => tx.id === id);
    tx?.cancel();
  }, []);

  const startNewTransaction = useCallback(() => {
    setMainTxId(null);
  }, []);

  const getLatestTransaction = useCallback(
    (name: TransactionName): TransactionExecutor<NewNotesTxResult> | null => {
      const txes = txQueue$.getValue().filter((tx) => tx.name === name);
      if (txes.length === 0) {
        return null;
      }
      return txes[txes.length - 1];
    },
    [],
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
