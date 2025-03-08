import { PayoutTxState } from '../types';

/**
 * Format an array of era numbers into a comma-separated string
 * @param eras Array of era numbers to format
 * @returns Formatted string of eras
 */
export const formatEras = (eras: number[] | undefined): string => {
  if (!eras || eras.length === 0) return '-';
  return eras.join(', ');
};

/**
 * Calculate progress percentage for payout transactions
 * @param params Parameters for progress calculation
 * @returns Progress percentage (0-100)
 */
export const calculatePayoutProgress = (params: {
  isCompleted: boolean;
  txState: string;
  currentIndex: number;
  processedCount: number;
  totalCount: number;
  isIdle: boolean;
}): number => {
  const { isCompleted, processedCount, totalCount, isIdle, currentIndex } =
    params;

  if (isCompleted) return 100;
  if (isIdle && currentIndex === 0 && processedCount === 0) return 0;

  if (totalCount <= 0) return 100;
  return (processedCount / totalCount) * 100;
};

/**
 * Check if a transaction is in a processing state
 * @param txState Current transaction state
 * @returns Boolean indicating if transaction is processing
 */
export const isTransactionProcessing = (txState: PayoutTxState): boolean => {
  return (
    txState === PayoutTxState.PROCESSING || txState === PayoutTxState.WAITING
  );
};

/**
 * Check if a transaction is completed
 * @param txState Current transaction state
 * @param processedCount Number of processed items
 * @param totalCount Total number of items
 * @returns Boolean indicating if transaction is completed
 */
export const isTransactionCompleted = (params: {
  txState: PayoutTxState;
  processedCount: number;
  totalCount: number;
}): boolean => {
  const { txState, processedCount, totalCount } = params;
  return (
    txState === PayoutTxState.COMPLETED ||
    (processedCount > 0 && processedCount >= totalCount)
  );
};

/**
 * Get the button text based on transaction state
 * @param params Parameters for determining button text
 * @returns Button text
 */
export const getPayoutButtonText = (params: {
  txState: PayoutTxState;
  isCompleted: boolean;
  hasNextItem: boolean;
  hasItemsToProcess: boolean;
}): string => {
  const { txState, isCompleted, hasNextItem, hasItemsToProcess } = params;

  if (!hasItemsToProcess) return 'No Rewards to Claim';
  if (isCompleted) return 'Close';
  if (txState === PayoutTxState.SUCCESS && hasNextItem)
    return 'Process Next Batch';
  if (txState === PayoutTxState.ERROR) return 'Retry';
  return 'Confirm Payout';
};
