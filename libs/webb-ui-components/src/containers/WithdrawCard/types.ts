import { ComponentProps } from 'react';
import { PropsOf } from '../../types';

import {
  AmountInput,
  Button,
  FixedAmount,
  RecipientInput,
  RefundInput,
  RelayerInput,
  Switcher,
  TitleWithInfo,
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
   * The received amount
   */
  receivedAmount?: number | string;

  /**
   * The received token symbol
   */
  receivedToken?: string;

  /**
   * The received info
   */
  receivedInfo?: ComponentProps<typeof TitleWithInfo>['info'];

  /**
   * Indicates if the fee is being fetched
   */
  isFetchingFee?: boolean;

  /**
   * The fee amount
   */
  feeAmount?: number | string;

  /**
   * The fee percentage to display
   */
  feePercentage?: number;

  /**
   * The remainder amount
   */
  remainderAmount?: number | string;

  /**
   * The remainder token symbol
   */
  remainderToken?: string;

  /**
   * The refund amount
   */
  refundAmount?: number | string;

  /**
   * The refund token symbol
   */
  refundToken?: string;

  /**
   * The withdraw button props
   */
  withdrawBtnProps?: ComponentProps<typeof Button>;
}
