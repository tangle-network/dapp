export type TransactionItemVariant = 'Withdraw' | 'Deposit' | 'Transfer ';
export type TransactionItemStatus = 'In-progress' | 'warning' | 'completed';

export type BridgeLabel = {
  amount: string;
  token: string;
  tokenURI: string;
};
export type NativeLabel = {
  amount: string;
  nativeValue: string;
};
type StepInfo =
  | string
  | {
      label: string;
      value: string;
      uri: string;
    };
/**
 * Transaction item
 * @param method - Transaction method
 * @param status - in
 * @param note - Information note for the notification item
 * */
export type TransactionItem = {
  method: string;
  firedAt: Date;
  note?: string;
  stepInfo?: StepInfo;
  status: TransactionItemStatus;
  tokens: JSX.Element[];
  headerAction?: JSX.Element;
  wallets: {
    src: JSX.Element;
    dist: JSX.Element;
  };
  label: BridgeLabel | NativeLabel;
  onDismiss(): void;
  onDetails(): void;
};

export type TransactionProgressCardProps = {
  transactions: TransactionItem[];
  collapsed?: boolean;
};
