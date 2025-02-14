import { notificationApi } from '@webb-tools/webb-ui-components';

import { TxStatus } from '../hooks/useSubstrateTx';

const prepareTxNotification = (
  status: TxStatus,
  error: Error | null,
): Parameters<typeof notificationApi>[0] | null => {
  let primaryMessage: string | null = null;
  let secondaryMessage: string | null = null;
  let variant: 'error' | 'success' | 'warning' | 'default' | 'info' = 'default';

  switch (status) {
    case TxStatus.COMPLETE:
      primaryMessage = 'Transaction completed successfully.';
      variant = 'success';

      break;
    case TxStatus.ERROR:
      primaryMessage = 'An error occurred during the transaction.';
      secondaryMessage = error?.message || null;
      variant = 'error';

      break;
    default:
      return null;
  }

  return {
    variant,
    message: primaryMessage,
    secondaryMessage: secondaryMessage ?? undefined,
  };
};

export default prepareTxNotification;
