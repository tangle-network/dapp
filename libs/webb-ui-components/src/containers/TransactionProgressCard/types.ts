import { PropsOf } from '../../types';

export type TransactionItemVariant = 'Withdraw' | 'Deposit' | 'Transfer';
export type TransactionItemStatus = 'in-progress' | 'warning' | 'completed';
/**
 * Card Footer props
 * @param isLoading - The TX is `in-progress` status
 * @param message - A Direct message for the footer
 * @param link - A message that has a URI that can be used to navigate for more info
 * @param hasWarning - The transaction has failed
 * */
export type TransactionCardFooterProps = {
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
  footer: TransactionCardFooterProps;
  onDismiss(): void;
  onDetails?(): void;
  onSyncNote?(): void;
}

/**
 * Transaction status
 * txHash - Optional transaction hash
 * recipient - Optional recipient address
 * status - The status of the transaction
 * message - Arbitrary message string
 * */
interface TransactionStatus {
  txHash?: string;
  recipient?: string;
  status: TransactionItemStatus;
  message?: string;
}
/**
 * Transaction item interface for the TransactionQueue component
 * @param id - Transaction id
 * @param method - The transaction method variant
 * @param timestamp - The transaction update timestamp
 * @param txStatus - Transaction status
 * @param tokens - The transaction related token names
 * @param wallet - React ui Element to demo the src/dist  wallets
 * @param amount - Transaction value
 * @param token - The transaction token name
 * @param nativeValue - Used to show the current value against USD
 * @param getExplorerURI - A provider method to get the explorer URI for an address or transaction
 * @param onDismiss - Callback that is called when the notification is dismissed
 * @param onDetails - Callback that is called when the `Details` button is click
 * @param onSync  - callback that is called when the `Sync Note` Button is clicked
 *
 * */
export interface TransactionPayload {
  id: string;
  method: TransactionItemVariant;
  timestamp: Date;
  txStatus: TransactionStatus;
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
/**
 * Transaction queue props
 * @param transactions - list of the active transactions
 * @param collapsed - Optional initial/current value of the queue notification
 * @param onCollapseChange - Handler for the change of the collapsed state if provided it's the responsibly of the user to
 * show/hide notification (Set the value of the props `collapsed`)
 *
 * */
export type TransactionQueueProps = {
  transactions: TransactionPayload[];
  collapsed?: boolean;
  onCollapseChange?(collapsed: boolean): void;
};
