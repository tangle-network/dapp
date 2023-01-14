import {
  NewNotesTxResult,
  Transaction,
  TransactionState,
  VAnchorActions,
} from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { useCallback, useMemo, useState } from 'react';
import { useTxQueue } from '../transaction';

export interface VAnchorAPI {
  cancel(): Promise<void>;
  stage: TransactionState;

  /**
   * Get the latest transaction of the given name
   * @param name The name of the transaction (Deposit, Withdraw, Transfer)
   * @returns The latest transaction of the given name or null if no transaction is found
   */
  getLatestTx(
    name: 'Deposit' | 'Withdraw' | 'Transfer'
  ): Transaction<NewNotesTxResult> | null;
  error: string;
  api: VAnchorActions<any> | null;
  startNewTransaction(): void;
}

export const useVAnchor = (): VAnchorAPI => {
  const { activeApi } = useWebContext();
  const [error] = useState('');
  const { txQueue, currentTxId, api: txQueueApi } = useTxQueue();

  const stage = useMemo(() => {
    const txes = txQueue.filter((tx) => tx.name === 'Deposit');
    if (txes.length === 0 || currentTxId === null) {
      return TransactionState.Ideal;
    }
    const lastTx = txes[txes.length - 1];
    return lastTx.currentStatus[0];
  }, [txQueue, currentTxId]);

  /**
   * Get the latest transaction of the given name
   * @param name The name of the transaction (Deposit, Withdraw, Transfer)
   * @returns The latest transaction of the given name or null if no transaction is found
   */
  const getLatestTx = useCallback(
    (
      name: 'Deposit' | 'Withdraw' | 'Transfer'
    ): Transaction<NewNotesTxResult> | null => {
      const txes = txQueue.filter((tx) => tx.name === name);
      if (txes.length === 0) {
        return null;
      }
      return txes[txes.length - 1];
    },
    [txQueue]
  );

  /// api
  const api = useMemo(() => {
    const api = activeApi?.methods.variableAnchor.actions;
    if (!api?.enabled) {
      return null;
    }
    return api.inner;
  }, [activeApi]);

  const cancel = useCallback(() => {
    if (!api) {
      throw new Error('Api not ready');
    }
    return api.cancel().catch(console.error);
  }, [api]);

  return {
    stage,
    getLatestTx,
    startNewTransaction: txQueueApi.startNewTransaction,
    api,
    error,
    cancel,
  };
};
