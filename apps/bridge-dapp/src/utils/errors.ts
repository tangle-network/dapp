import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { SnackBarOpts } from '@webb-tools/webb-ui-components';
import { Transaction } from 'ethers';

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
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    Boolean(error.message)
  );
};

/**
 * Check if an unknown error has a `reason` property
 * @param error The `unknown` error to check
 * @returns true if the error has a `reason` property
 */
const hasReason = (error: unknown): error is { reason: string } => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'reason' in error &&
    Boolean(error.reason)
  );
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

/**
 * Check if an unknown error has a `transactionHash` property
 */
const hasTransactionHash = (
  error: unknown
): error is { transactionHash: string } => {
  return (
    typeof error === 'object' && error !== null && 'transactionHash' in error
  );
};

/**
 * Check if an unknown error has a `transaction` property
 */
const hasTransaction = (
  error: unknown
): error is { transaction: Transaction } => {
  return typeof error === 'object' && error !== null && 'transaction' in error;
};

/**
 * Check if an unknown error has a `receipt` property
 */
const hasReceipt = (
  error: unknown
): error is { receipt: TransactionReceipt } => {
  return typeof error === 'object' && error !== null && 'receipt' in error;
};

/**
 * Get the transaction hash from an unknown type error
 * @param error The `unknown` error to parse and get the transaction hash from
 * @returns the transaction hash from the unknown error or '' if not found
 */
export const getTransactionHash = (error: unknown) => {
  if (hasTransactionHash(error)) {
    return error.transactionHash;
  }

  if (hasTransaction(error)) {
    return error.transaction?.hash ?? '';
  }

  if (hasReceipt(error)) {
    return error.receipt?.transactionHash ?? '';
  }

  return '';
};
