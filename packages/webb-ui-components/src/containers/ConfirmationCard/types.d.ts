import { PropsOf } from '@webb-dapp/webb-ui-components/types';
import { ComponentProps } from 'react';

import { Button, CheckBox, TokensRing } from '../../components';

export interface ConfirmationCardProps extends PropsOf<'div'> {
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
}

export interface DepositConfirmProps extends ConfirmationCardProps {
  /**
   * The source chain symbol
   */
  sourceChain?: ComponentProps<typeof TokensRing>['sourceChain'];

  /**
   * The destination chain symbol
   */
  destChain?: ComponentProps<typeof TokensRing>['destChain'];

  /**
   * The transaction amount
   */
  amount?: number | string;

  /**
   * The first token symbol
   */
  token1Symbol?: string;

  /**
   * The second token symbol
   */
  token2Symbol?: string;

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
