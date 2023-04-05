import { TransactionState } from '@webb-tools/abstract-api-provider';

export const getCardTitle = (
  stage: TransactionState,
  wrappingFlow: boolean
) => {
  let status = '';

  switch (stage) {
    case TransactionState.Ideal: {
      break;
    }

    case TransactionState.Done: {
      status = 'Completed';
      break;
    }

    case TransactionState.Failed: {
      status = 'Failed';
      break;
    }

    default: {
      status = 'in Progress...';
      break;
    }
  }

  if (!status)
    return wrappingFlow ? 'Confirm Wrap and Deposit' : 'Confirm Deposit';

  return wrappingFlow ? `Wrap and Deposit ${status}` : `Deposit ${status}`;
};
