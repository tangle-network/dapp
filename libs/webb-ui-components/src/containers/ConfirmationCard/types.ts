import { PropsOf } from '../../types';
import { ComponentProps } from 'react';

import { Avatar, Button, CheckBox } from '../../components';
import { UseCopyableReturnType } from '../../hooks';

export interface ConfirmationCardProps extends PropsOf<'div'> {
  /**
   * The transaction amount
   */
  amount?: number | string;

  /**
   * The active chain
   */
  activeChains: string[];

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
  sourceChain?: {
    type: string;
    name: string;
  };

  /**
   * The destination chain symbol
   */
  destChain?: {
    type: string;
    name: string;
  };

  /**
   * The transaction progress
   */
  progress?: number | null;

  /**
   * Fee amount
   */
  fee?: number | string;

  /**
   * The note string
   */
  note?: string | null;

  copyProps?: UseCopyableReturnType;

  /**
   * The boolean value indicating if the copy button is click
   */
  isCopied?: boolean;

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

  /**
   * The transaction status message
   */
  txStatusMessage?: string;
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
   * Due to wrapping fees, a wrapping amount would be larger than the bridged amount.
   */
  wrappingAmount?: string;
}

export interface WithdrawConfirmationProps extends ConfirmationCardProps {
  /**
   * The change amount
   */
  changeAmount?: number | string;

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
   * The relayer address
   */
  relayerAddress?: string;

  /**
   * The relayer external url
   */
  relayerExternalUrl?: string;

  /**
   * The recipient address
   */
  recipientAddress: string;
}

export interface TransferConfirmProps extends ConfirmationCardProps {
  /**
   * The change amount
   */
  changeAmount?: number | string;

  /**
   * The first token symbol
   */
  fungibleTokenSymbol?: string;

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
   * Recipient public key
   */
  recipientPublicKey?: string;
}
