export type TxTableItemType = {
  txHash: string;
  activity: 'deposit' | 'withdraw' | 'transfer';
  tokenAmount: string;
  tokenSymbol: string;
  sourceTypedChainId: number;
  destinationTypedChainId: number;
  recipient?: string;
  timestamp: number;
};

export interface TxTableContainerProps {
  data: TxTableItemType[];
  pageSize: number;
  hideRecipientCol?: boolean;
  className?: string;
}
