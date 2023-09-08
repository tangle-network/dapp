import { type TransactionName } from '@webb-tools/abstract-api-provider/transaction';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { notificationApi } from '@webb-tools/webb-ui-components/components/Notification/NotificationStacked';

function handleTxError(error: unknown, txType?: TransactionName) {
  let displayErrorMessage = WebbError.getErrorMessage(
    WebbErrorCodes.UnknownError
  ).message;

  if (error instanceof WebbError) {
    displayErrorMessage = error.message;
  } else if (error instanceof Error) {
    displayErrorMessage = error.message;
  } else {
    console.error('Detected unknown error', error);
  }

  notificationApi({
    variant: 'error',
    message: `${txType ?? 'Transaction'} failed`,
    secondaryMessage: displayErrorMessage,
  });
}

export default handleTxError;
