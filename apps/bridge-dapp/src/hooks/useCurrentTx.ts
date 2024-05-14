import type { TransactionExecutor } from '@webb-tools/abstract-api-provider/transaction/index.js';
import { useMemo } from 'react';

/**
 * Get the current transaction from the transaction queue
 * @param txQueue the transaction queue to search
 * @param txId the optional transaction id to search for
 * @returns the transaction if found, otherwise the latest transaction
 */
const useCurrentTx = (
  txQueue: Array<TransactionExecutor<unknown>>,
  txId?: string | null,
  opts?: {
    /**
     * If true, return the latest tx if the txId is not found
     */
    latest?: boolean;
  }
) => {
  return useMemo(() => {
    if (typeof txId === 'string') {
      return txQueue.find((tx) => tx.id === txId);
    }

    // Get the latest tx
    if (opts?.latest) {
      return txQueue[0];
    }
  }, [opts?.latest, txId, txQueue]);
};

export default useCurrentTx;
