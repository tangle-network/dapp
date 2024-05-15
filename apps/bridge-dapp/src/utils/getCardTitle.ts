import {
  type TransactionName,
  TransactionState,
} from '@webb-tools/abstract-api-provider/transaction';

export const getCardTitle = (
  stage: TransactionState,
  txName: TransactionName,
  wrappingFlow?: boolean
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

  if (!status) {
    return getDefaultTitle(txName, wrappingFlow);
  }
  return getStatusTitle(status, txName, wrappingFlow);
};

const getDefaultTitle = (txName: TransactionName, wrappingFlow?: boolean) => {
  switch (txName) {
    case 'Deposit': {
      return wrappingFlow ? 'Confirm Wrap and Deposit' : 'Confirm Deposit';
    }

    case 'Withdraw': {
      return wrappingFlow ? 'Confirm Unwrap and Withdraw' : 'Confirm Withdraw';
    }

    case 'Transfer': {
      return 'Confirm Transfer';
    }
  }
};

const getStatusTitle = (
  status: string,
  txName: TransactionName,
  wrappingFlow?: boolean
) => {
  switch (txName) {
    case 'Deposit': {
      return wrappingFlow
        ? `Wrapping and Depositing ${status}`
        : `Depositing ${status}`;
    }

    case 'Withdraw': {
      return wrappingFlow
        ? `Unwrapping and Withdrawing ${status}`
        : `Withdrawing ${status}`;
    }

    case 'Transfer': {
      return `Transferring ${status}`;
    }
  }
};
