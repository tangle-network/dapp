import { PropsOf } from '../../types';
import { ComponentProps } from 'react';

import { Button, CheckBox, TokensRing } from '../../components';

export interface ConfirmationCardProps extends PropsOf<'div'> {
  /**
   * The transaction amount
   */
  amount?: number | string;

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
   * The source chain symbol
   */
  sourceChain?: ComponentProps<typeof TokensRing>['sourceChain'];

  /**
   * The destination chain symbol
   */
  destChain?: ComponentProps<typeof TokensRing>['destChain'];

  /**
   * The transaction progress
   */
  progress: number | null;

  /**
   * Fee amount
   */
  fee?: number | string;

  /**
   * The note string
   */
  note?: string;

  /**
   * Callback when user hits copy button
   * @returns void
   */
  onCopy?: () => void;

  /**
   * Callback when user hits download button
   * @returns void
   */
  onDownload?: () => void;

  /**
   * The checkbox props
   */
  checkboxProps?: ComponentProps<typeof CheckBox>;
}

export interface DepositConfirmProps extends ConfirmationCardProps {
  governedTokenSymbol?: string;
  wrappableTokenSymbol?: string;
}

export interface WithdrawConfirmationProps extends ConfirmationCardProps {
  /**
   * The change amount
   */
  changeAmount?: number | string;

  /**
   * The first token symbol
   */
  governedTokenSymbol?: string;

  /**
   * The second token symbol
   */

  wrappableTokenSymbol?: string;

  /**
   * The relayer address
   */
  relayerAddress?: string;

  /**
   * The relayer external url
   */
  relayerExternalUrl?: string;

  /**
   * Unshielded address
   */
  unshieldedAddress?: string;
}

export interface TransferConfirmProps extends ConfirmationCardProps {
  /**
   * The change amount
   */
  changeAmount?: number | string;

  /**
   * The first token symbol
   */
  governedTokenSymbol?: string;

  /**
   * The relayer address
   */
  relayerAddress?: string;

  /**
   * The relayer external url
   */
  relayerExternalUrl?: string;

  /**
   * Recipient address
   */
  recipientAddress?: string;
}
