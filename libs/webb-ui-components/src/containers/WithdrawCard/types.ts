import { PropsOf } from '../../types';
import { ComponentElement, ComponentProps } from 'react';

import {
  AmountInput,
  Button,
  FixedAmount,
  RecipientInput,
  RelayerInput,
  ShieldedAssetInput,
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
   * The received amount
   */
  receivedAmount?: number;

  /**
   * The received token symbol
   */
  receivedToken?: string;

  /**
   * The fee amount
   */
  feeAmount?: number;

  /**
   * The fee percentage to display
   */
  feePercentage?: number;

  /**
   * The remainder amount
   */
  remainderAmount?: number;

  /**
   * The withdraw button props
   */
  withdrawBtnProps?: ComponentProps<typeof Button>;
}
