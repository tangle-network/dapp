import type { PropsOf } from '../../types';
import type { ComponentProps } from 'react';
import type {
  Avatar,
  Button,
  CheckBox,
  ChipColors,
  TitleWithInfo,
} from '../../components';

export interface ConfirmationCardProps extends PropsOf<'div'> {
  /**
   * Source Address
   */
  sourceAddress: string;

  /**
   * Destination Address
   */
  destAddress: string;

  /**
   * The transaction amount
   */
  amount: number;

  /**
   * The card title
   */
  title?: string;

  /**
   * The callback when user hits close button
   * @returns void
   */
  onClose?: () => void;

  /**
   * The card action button props
   */
  actionBtnProps?: ComponentProps<typeof Button>;

  /**
   * The source typed chain id
   */
  sourceTypedChainId: number;

  /**
   * The destination typed chain id
   */
  destTypedChainId: number;

  /**
   * The transaction progress
   */
  progress?: number | null;

  /**
   * Total progress (total number of steps)
   */
  totalProgress?: number;

  /**
   * Fee amount
   */
  fee?: number | string;

  /**
   * The fee token symbol
   */
  feeToken?: string;

  /**
   * The note string
   */
  note?: string | null;

  /**
   * Callback when user hits download button
   * @returns void
   */
  onDownload?: () => void;

  /**
   * The checkbox props
   */
  checkboxProps?: ComponentProps<typeof CheckBox>;

  /**
   * The transaction status message
   */
  txStatusMessage?: string;

  /**
   * The status chip color
   * @default 'blue'
   */
  txStatusColor?: ChipColors;

  /**
   * The address of the pool contract that the user is depositing to
   */
  poolAddress: string;

  /**
   * New balance if users decide to proceed with the transaction
   */
  newBalance?: number;
}

export interface DepositConfirmProps extends ConfirmationCardProps {
  /**
   * The fungible token symbol
   */
  fungibleTokenSymbol: string;

  /**
   * The wrappable token symbol
   */
  wrappableTokenSymbol?: string;

  /**
   * Due to wrapping fee, a wrapping amount would be larger than the bridged amount.
   */
  wrappingAmount?: number;
}

export interface WithdrawConfirmationProps extends ConfirmationCardProps {
  /**
   * The change amount
   */
  changeAmount?: number;

  /**
   * The first token symbol
   */
  fungibleTokenSymbol: string;

  /**
   * The second token symbol
   */

  wrappableTokenSymbol?: string;

  /**
   * The relayer avatar theme
   * @default 'polkadot'
   */
  relayerAvatarTheme?: ComponentProps<typeof Avatar>['theme'];

  /**
   * The remaining amount (amount - refundAmount)
   */
  remainingAmount?: number | string;

  /**
   * The refund amount
   */
  refundAmount?: number;

  /**
   * The refund token symbol
   */
  refundToken?: string;

  /**
   * The received info
   */
  receivingInfo?: ComponentProps<typeof TitleWithInfo>['info'];

  /**
   * Transaction fee info
   */
  feeInfo?: ComponentProps<typeof TitleWithInfo>['info'];

  /**
   * The relayer address
   */
  relayerAddress?: string;

  /**
   * The relayer external url
   */
  relayerExternalUrl?: string;
}

export interface TransferConfirmProps extends ConfirmationCardProps {
  /**
   * The change amount
   */
  changeAmount?: number;

  /**
   * The first token symbol
   */
  fungibleTokenSymbol: string;

  /**
   * The relayer address
   */
  relayerAddress?: string;

  /**
   * The relayer external url
   */
  relayerExternalUrl?: string;

  /**
   * The relayer avatar theme
   * @default 'polkadot'
   */
  relayerAvatarTheme?: ComponentProps<typeof Avatar>['theme'];

  /**
   * The recipient title props
   */
  recipientTitleProps?: Partial<ComponentProps<typeof TitleWithInfo>>;

  /**
   * Recipient public key
   */
  recipientPublicKey?: string;

  /**
   * The refund amount
   */
  refundAmount?: number;

  /**
   * The refund token symbol
   */
  refundToken?: string;

  /**
   * The address that will receive the refund
   */
  refundRecipient?: string;
}
