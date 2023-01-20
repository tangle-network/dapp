import { SnackBarOpts } from '@webb-tools/webb-ui-components';

export const DEPOSIT_FAILURE_MSG: Omit<SnackBarOpts, 'close'> = {
  variant: 'error',
  message: 'Deposit failed',
  secondaryMessage: 'Something went wrong when depositing',
};

/**
 * Check if an unknown error has a `message` property
 * @param error The `unknown` error to check
 * @returns true if the error has a `message` property
 */
const hasMessage = (error: unknown): error is { message: string } => {
  return typeof error === 'object' && error !== null && 'message' in error;
};

/**
 * Check if an unknown error has a `reason` property
 * @param error The `unknown` error to check
 * @returns true if the error has a `reason` property
 */
const hasReason = (error: unknown): error is { reason: string } => {
  return typeof error === 'object' && error !== null && 'reason' in error;
};

/**
 * Get the error message from an unknown type error
 * @param error The `unknown` error to check
 * @returns the error mssage from the unknown error
 */
export const getErrorMessage = (error: unknown) => {
  if (hasReason(error)) {
    return error.reason.slice(0, 50);
  }

  if (error instanceof Error) {
    return error.message.slice(0, 50);
  }

  if (typeof error === 'string') {
    return error.slice(0, 50);
  }

  if (hasMessage(error)) {
    return error.message.slice(0, 50);
  }

  return 'An unknown error occurred';
};
