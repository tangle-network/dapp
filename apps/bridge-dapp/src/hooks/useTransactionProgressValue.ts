import { TransactionState } from '@webb-tools/abstract-api-provider';
import { useEffect, useState } from 'react';

/**
 * Get the progress bar value from the transaction stage
 * @param stage The stage of the transaction
 * @returns The progress value for the progress bar component
 */
export const useTransactionProgressValue = (stage: TransactionState) => {
  // The progress bar value
  const [progress, setProgress] = useState<number | null>(null);

  // Effect to update the progress bar
  useEffect(() => {
    switch (stage) {
      case TransactionState.PreparingTransaction: {
        setProgress(5);
        break;
      }

      case TransactionState.FetchingLeaves: {
        setProgress(10);
        break;
      }

      case TransactionState.FetchingLeavesFromRelayer: {
        setProgress(15);
        break;
      }

      case TransactionState.FetchingFixtures: {
        setProgress(25);
        break;
      }

      case TransactionState.Intermediate: {
        setProgress(40);
        break;
      }

      case TransactionState.GeneratingZk: {
        setProgress(50);
        break;
      }

      case TransactionState.SendingTransaction: {
        setProgress(75);
        break;
      }

      case TransactionState.Done:
      case TransactionState.Failed: {
        setProgress(100);
        break;
      }

      case TransactionState.Cancelling:
      case TransactionState.Ideal: {
        setProgress(null);
        break;
      }

      default: {
        console.error(
          'Unknown transaction state in `useTransactionProgressValue` hook'
        );
        break;
      }
    }
  }, [stage, setProgress]);

  return progress;
};
