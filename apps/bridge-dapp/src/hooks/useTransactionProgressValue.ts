import { TransactionState } from '@webb-tools/dapp-types';
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
      case TransactionState.FetchingFixtures: {
        setProgress(0);
        break;
      }

      case TransactionState.FetchingLeaves: {
        setProgress(25);
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
        throw new Error(
          'Unknown transaction state in DepositConfirmContainer component'
        );
      }
    }
  }, [stage, setProgress]);

  return progress;
};
