export type TransactionItemVariant = 'Withdraw' | 'Deposit' | 'Transfer ';
export type TransactionItemStatus = 'In-progress' | 'warning' | 'completed';
/**
 * Transaction item
 * @param method - Transaction method
 * @param status - in
 * */
export type TransactionItem = {
  method: string;
  status: TransactionItemStatus;
  token: string;
  tokenIcons: JSX.Element[];
  metaData: string;
  firedAt: Date;
};

export type TransactionProgressCardProps = {
  transactions: TransactionItem[];
};
