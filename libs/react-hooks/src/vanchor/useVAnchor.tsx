import {
  NewNotesTxResult,
  Transaction,
  TransactionState,
  VAnchorActions,
} from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { Note, Utxo } from '@webb-tools/sdk-core';
import { useWebbUI } from '@webb-tools/webb-ui-components';
import { log } from 'console';
import { BigNumberish } from 'ethers';
import { useCallback, useMemo, useState } from 'react';
import { useTxQueue } from '../transaction';

export interface VAnchorAPI {
  cancel(): Promise<void>;
  stage: TransactionState;
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
    startNewTransaction: txQueueApi.startNewTransaction,
    api,
    error,
    cancel,
  };
};
