import { downloadString } from '@webb-tools/browser-utils';

export type DownloadTxType = {
  hash: string;
  activity: 'deposit' | 'transfer' | 'withdraw';
  amount: string | number;
  from: string;
  to: string;
  blockExplorerUrl: string | null;
  fungibleTokenSymbol: string;
  wrappableTokenSymbol: string | null;
  timestamp: number;
  relayerName: string | null;
  relayerFees: string | number | null;
  inputNoteSerializations: string[] | null;
  outputNoteSerializations: string[] | null;
};

/**
 * Convert tx history to json and download it
 * @param notes the notes to download
 * @returns boolean - true if the download was successful
 */
const downloadTxHistory = (transactions: DownloadTxType[]): boolean => {
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
