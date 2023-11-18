import type { TransactionType } from '@webb-tools/abstract-api-provider';
import { downloadString } from '@webb-tools/browser-utils';

/**
 * Convert tx history to json and download it
 * @param transactions transactions to be downloaded
 */
const downloadTxHistory = (transactions: TransactionType[]): boolean => {
  try {
    downloadString(
      JSON.stringify(transactions),
      `txHistory-${Date.now()}.json`,
      '.json'
    );
    return true;
  } catch (error) {
    console.log('Error while downloading notes', error);
    return false;
  }
};

export default downloadTxHistory;
