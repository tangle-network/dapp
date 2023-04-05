import { ComponentProps } from 'react';
import { PropsOf } from '../../types';

import {
  AmountInput,
  Button,
  ChainInput,
  RecipientInput,
  RelayerInput,
  TokenInput,
} from '../../components';

export interface TransferCardProps extends PropsOf<'div'> {
  /**
   * The bridge asset input props
   */
  bridgeAssetInputProps?: ComponentProps<typeof TokenInput>;

  /**
   * Destination chain input props
   */
  destChainInputProps?: ComponentProps<typeof ChainInput>;

  /**
   * The amount input props
   */
  amountInputProps?: ComponentProps<typeof AmountInput>;

  /**
   * The relayer input props
   */
  relayerInputProps?: ComponentProps<typeof RelayerInput>;

  /**
   * The recipient input props
   */
  recipientInputProps?: ComponentProps<typeof RecipientInput>;

  /**
   * The transfer amount
   */
  transferAmount?: number | string;

  /**
   * The transfer token symbol
   */
  transferToken?: string;

  /**
   * The fee amount
   */
  feeAmount?: number | string;

  /**
   * The fee token symbol
   */
  feeToken?: string;

  /**
   * The fee percentage to display
   */
  feePercentage?: number;

  /**
   * The remainder amount
   */
  changeAmount?: number | string;

  /**
   * The withdraw button props
   */
  transferBtnProps?: ComponentProps<typeof Button>;
}
