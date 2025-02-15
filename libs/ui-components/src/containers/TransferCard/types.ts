import { ComponentProps } from 'react';
import { PropsOf } from '../../types';

import {
  AmountInput,
  Button,
  ChainInput,
  InfoItem,
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
   * The info item props to pass to the info item component
   */
  infoItemProps?: Array<ComponentProps<typeof InfoItem>>;

  /**
   * The withdraw button props
   */
  transferBtnProps?: ComponentProps<typeof Button>;

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
