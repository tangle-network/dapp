import { IWebbComponentBase, PropsOf } from '../../types';

export interface TimeLineProps extends PropsOf<'div'>, IWebbComponentBase {}

export interface TimeLineItemProps extends PropsOf<'div'>, IWebbComponentBase {
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
