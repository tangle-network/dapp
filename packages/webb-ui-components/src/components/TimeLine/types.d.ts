import { PropsOf, WebbComponentBase } from '@webb-dapp/webb-ui-components/types';

export interface TimeLineProps extends PropsOf<'div'>, WebbComponentBase {}

export interface TimeLineItemProps extends PropsOf<'div'>, WebbComponentBase {
  /**
   * The timeline title
   */
  title: string;
  /**
   * The actual time the event happens
   */
  time: Date;
  /**
   * The transaction hash
   */
  txHash: string;
  /**
   * External url to the transaction
   */
  externalUrl: string;
  /**
   * The extra content to display under the tx hash section
   */
  extraContent?: React.ReactElement;
  /**
   * If `true`, the spinner icon will be displayed
   */
  isLoading?: boolean;
}
