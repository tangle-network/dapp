import { SnackBarOpts } from '@webb-tools/webb-ui-components';

export const DEPOSIT_FAILURE_MSG: Omit<SnackBarOpts, 'close'> = {
  variant: 'error',
  message: 'Deposit failed',
  secondaryMessage: 'Something went wrong when depositing',
};
