import { PropsOf } from '@webb-dapp/webb-ui-components/types';

export type TransactionItemVariant = 'Withdraw' | 'Deposit' | 'Transfer';
export type TransactionItemStatus = 'in-progress' | 'warning' | 'completed';

export type TXCardFooterProps = {
  isLoading?: boolean;
  message?: string | JSX.Element;
  link?: {
    text: string | JSX.Element;
    uri: string;
  };
  hasWarning?: boolean;
};
export type BridgeLabel = {
  amount: string;
  token: string;
  tokenURI: string;
};
export type NativeLabel = {
  amount: string;
  nativeValue: string;
};

/**
 * Transaction item
 * @param method - Transaction method
 * @param status - in
 * @param note - Information note for the notification item
 * */
export interface TransactionCardItemProps extends PropsOf<'div'> {
  method: TransactionItemVariant;
  firedAt: Date;
  note?: string;
  status: TransactionItemStatus;
  tokens: Array<JSX.Element>;
  wallets: {
    src: JSX.Element;
    dist: JSX.Element;
  };
  label: BridgeLabel | NativeLabel;
  footer: TXCardFooterProps;
  onDismiss(): void;
  onDetails?(): void;
  onSyncNote?(): void;
}
export interface TransactionPayload {
  id: string;
  method: TransactionItemVariant;
  timestamp: Date;
  txStatus: {
    THash?: string;
    recipient?: string;
    status: TransactionItemStatus;
    message?: string;
  };
  tokens: string[];
  wallets: {
    src: JSX.Element;
    dist: JSX.Element;
  };
  amount: string;
  token: string;

  nativeValue?: string;

  getExplorerURI?(addOrTxHash: string, variant: 'tx' | 'address'): string;

  onDismiss(): void;
  onDetails?(): void;
  onSyncNote?(): void;
}
export type TransactionProgressCardProps = {
  transactions: TransactionPayload[];
  collapsed?: boolean;
  onCollapseChange?(collapsed: boolean): void;
};
