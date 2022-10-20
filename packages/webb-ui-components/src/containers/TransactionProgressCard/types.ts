import { PropsOf } from '@webb-dapp/webb-ui-components/types';

export type TransactionItemVariant = 'Withdraw' | 'Deposit' | 'Transfer';
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
export interface TransactionCardItemProps<Token> extends PropsOf<'div'> {
  method: TransactionItemVariant;
  firedAt: Date;
  note?: string;
  stepInfo?: StepInfo;
  status: TransactionItemStatus;
  tokens: Record<Token, JSX.Element>;
  headerAction?: JSX.Element;
  wallets: {
    src: JSX.Element;
    dist: JSX.Element;
  };
  label: BridgeLabel | NativeLabel;
  onDismiss(): void;
  onDetails(): void;
}

export type TransactionProgressCardProps = {
  transactions: TransactionCardItemProps[];
  collapsed?: boolean;
};
