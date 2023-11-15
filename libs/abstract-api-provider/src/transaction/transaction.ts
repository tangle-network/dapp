export type TransactionActivity = 'deposit' | 'transfer' | 'withdraw';

export type TransactionType = {
  hash: string;
  activity: TransactionActivity;
  amount: number;
  noteAccountAddress: string;
  walletAddress?: string;
  fungibleTokenSymbol: string;
  wrappableTokenSymbol?: string;
  timestamp: number;
  relayerName?: string;
  relayerFeeAmount?: number;
  inputNoteSerializations?: string[];
  outputNoteSerializations?: string[];
};

export class Transaction {
  constructor(public data: TransactionType) {}
}
