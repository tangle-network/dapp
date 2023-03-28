import * as Sentry from '@sentry/react';

/**
 * Capture an exception in Sentry with custom tags for transaction type and operation context.
 *
 * @function
 * @param {any} error - The error object to capture.
 * @param {string} transactionTag - The tag key representing the transaction type (e.g., 'transactionType').
 * @param {string} operationTag - The tag value representing the context of the error within the transaction (e.g., 'deposit').
 */
export const captureSentryException = (
  error: any,
  transactionTag: string,
  operationTag: string
) => {
  Sentry.withScope((scope) => {
    scope.setTag(transactionTag, operationTag);
    Sentry.captureException(error);
  });
};
