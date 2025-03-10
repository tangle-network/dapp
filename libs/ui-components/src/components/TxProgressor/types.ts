import { StatusIndicatorProps } from '@tangle-network/icons/StatusIndicator/types';
import { Decimal } from 'decimal.js';

import { PropsOf, TokenType } from '../../types';
import { SteppedProgressProps } from '../Progress/types';

export type TxName = 'Deposit' | 'Withdraw' | 'Transfer';

export interface TxProgressorRootProps extends PropsOf<'div'> {}

export type TxInfo = {
  /**
   * The typed chain id to display
   * the chain info
   */
  typedChainId: number;

  /**
   * The wallet address to display
   */
  walletAddress?: string;

  /**
   * The account type to display
   * @default 'wallet'
   */
  accountType?: 'wallet' | 'note';

  /**
   * The amount of the transaction to display
   */
  amount: Decimal;

  /**
   * The token symbol to display the token info
   */
  tokenSymbol: string;

  /**
   * The token type to display the token icon or shielded icon
   * @default 'unshielded'
   */
  tokenType?: TokenType;

  /**
   * The isSource flag to display the source info
   */
  isSource?: boolean;

  /**
   * The text for the tooltip
   */
  tooltipContent?: string;
};

export interface TxProgressorHeaderProps extends PropsOf<'div'> {
  /**
   * The name of the transaction
   */
  name: string;

  /**
   * Created time of the transaction
   * @default Date.now()
   */
  createdAt?: Date | number;
}

export interface TxProgressorBodyProps extends PropsOf<'div'> {
  /**
   * The source info of the transaction
   * @type {TxInfo}
   */
  txSourceInfo: TxInfo;

  /**
   * The destination info of the transaction
   * @type {TxInfo}
   */
  txDestinationInfo: TxInfo;
}

export interface TxProgressorFooterProps extends PropsOf<'div'> {
  /**
   * The stepped progress props to display the progress bar component
   */
  steppedProgressProps?: SteppedProgressProps;

  /**
   * The status of the transaction
   * @default 'info'
   */
  status?: StatusIndicatorProps['variant'];

  /**
   * The status message of the transaction
   * to describe the current status
   */
  statusMessage?: string;

  /**
   * The external url to display the external link
   */
  externalUrl?: URL;

  /**
   * The action props to display the action button
   */
  actionCmp?: React.ReactNode;

  /**
   * The destination tx status of the transaction
   * @default 'info'
   */
  destinationTxStatus?: StatusIndicatorProps['variant'];

  /**
   * The destination tx status message of the transaction
   * to describe the current status
   */
  destinationTxStatusMessage?: string;

  /**
   * The destination tx explorer url to display the external link
   */
  destinationTxExplorerUrl?: URL;
}
