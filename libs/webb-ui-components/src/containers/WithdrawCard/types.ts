import { ComponentProps } from 'react';
import { PropsOf } from '../../types';

import {
  AmountInput,
  Button,
  FixedAmount,
  InfoItem,
  RecipientInput,
  RefundInput,
  RelayerInput,
  Switcher,
  TokenInput,
} from '../../components';

export interface WithdrawCardProps extends PropsOf<'div'> {
  /**
   * The bridge asset input props
   */
  tokenInputProps?: ComponentProps<typeof TokenInput>;

  /**
   * The unwrapping asset input props
   */
  unwrappingAssetInputProps?: ComponentProps<typeof TokenInput>;

  /**
   * The unwrap switcher props
   */
  unwrapSwitcherProps?: ComponentProps<typeof Switcher>;

  /**
   * The fixed amount props
   */
  fixedAmountInputProps?: ComponentProps<typeof FixedAmount>;

  /**
   * The custom amount props
   */
  customAmountInputProps?: ComponentProps<typeof AmountInput>;

  /**
   * The relayer input props
   */
  relayerInputProps?: ComponentProps<typeof RelayerInput>;

  /**
   * The recipient input props
   */
  recipientInputProps?: ComponentProps<typeof RecipientInput>;

  /**
   * The refund input props
   */
  refundInputProps?: ComponentProps<typeof RefundInput>;

  /**
   * The info item props to pass to the info item component
   */
  infoItemProps?: Array<ComponentProps<typeof InfoItem>>;

  /**
   * The withdraw button props
   */
  withdrawBtnProps?: ComponentProps<typeof Button>;

  /**
   * The description message display below the withdraw button
   */
  buttonDesc?: string;

  /**
   * The variant of message display below the withdraw button
   * @default 'info'
   */
  buttonDescVariant?: 'info' | 'error';
}
