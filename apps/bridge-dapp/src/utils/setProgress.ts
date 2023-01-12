import { TransactionState } from '@webb-tools/dapp-types';

export const updateProgress = (
  stage: TransactionState,
  setProgress: React.Dispatch<number | null>
) => {
  switch (stage) {
    case TransactionState.FetchingFixtures: {
      setProgress(0);
      break;
    }

    case TransactionState.FetchingLeaves: {
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
      throw new Error(
        'Unknown transaction state in DepositConfirmContainer component'
      );
    }
  }
};
