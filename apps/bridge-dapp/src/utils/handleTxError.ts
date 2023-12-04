import type { TransactionName } from '@webb-tools/abstract-api-provider/transaction';
import type { WrapperEventType } from '@webb-tools/abstract-api-provider/wrap-unwrap';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { notificationApi } from '@webb-tools/webb-ui-components/components/Notification/NotificationStacked';

function handleTxError(
  error: unknown,
  txType?: TransactionName | WrapperEventType
) {
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
    secondaryMessage: txType?.toLowerCase().includes('wrap')
      ? 'Transaction rejected. Please authorize in your wallet to proceed.'
      : displayErrorMessage,
  });
}

export default handleTxError;
