import { StatusIndicatorProps } from '@webb-tools/icons/StatusIndicator/types';
import { PropsOf, TokenType } from '../../types';
import { SteppedProgressProps } from '../Progress/types';
import { ButtonProps } from '../buttons';

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
  amount: number;

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
};

export interface TxProgressorHeaderProps extends PropsOf<'div'> {
  /**
   * The name of the transaction
   */
  name: TxName;

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
  actionProps?: ButtonProps;
}
