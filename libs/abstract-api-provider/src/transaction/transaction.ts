export type TransactionActivity = 'deposit' | 'transfer' | 'withdraw';

export type TransactionType = {
  hash: string;
  activity: TransactionActivity;
  amount: number;
  fromAddress: string;
  recipientAddress: string;
  fungibleTokenSymbol: string;
  wrapTokenSymbol?: string;
  unwrapTokenSymbol?: string;
  timestamp: number;
  relayerName?: string;
  relayerFeesAmount?: number;
  relayerUri?: string;
  refundAmount?: number;
  refundRecipientAddress?: string;
  refundTokenSymbol?: string;
  inputNoteSerializations?: string[];
  outputNoteSerializations?: string[];
  explorerUri?: string;
  sourceTypedChainId: number;
  destinationTypedChainId: number;
};
