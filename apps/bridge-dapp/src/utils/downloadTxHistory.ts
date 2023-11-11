import { downloadString } from '@webb-tools/browser-utils';

export type DownloadTxType = {
  hash: string;
  activity: 'deposit' | 'transfer' | 'withdraw';
  amount: string | number;
  noteAccountAddress: string;
  walletAddress: string | null;
  fungibleTokenSymbol: string;
  wrappableTokenSymbol: string | null;
  timestamp: number;
  relayerName: string | null;
  relayerFees: string | number | null;
  inputNoteSerializations: string[] | null;
  outputNoteSerializations: string[] | null;
  sourceTypedChainId: number | null;
  destinationTypedChainId: number | null;
};

/**
 * Convert tx history to json and download it
 * @param notes the notes to download
 * @returns boolean - true if the download was successful
 */
export const downloadTxHistory = (transactions: DownloadTxType[]): boolean => {
  try {
    downloadString(
      JSON.stringify(transactions),
      `notes-${Date.now()}.json`,
      '.json'
    );
    return true;
  } catch (error) {
    console.log('Error while downloading notes', error);
    return false;
  }
};
