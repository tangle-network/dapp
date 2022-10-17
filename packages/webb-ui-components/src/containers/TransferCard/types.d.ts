import { PropsOf } from '@webb-dapp/webb-ui-components/types';
import { ComponentProps } from 'react';

import { AmountInput, Button, ChainInput, ShieldedAssetInput } from '../../components';

export interface TransferCardProps extends PropsOf<'div'> {
  /**
   * The bridge asset input props
   */
  bridgeAssetInputProps?: ComponentProps<typeof ShieldedAssetInput>;

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
  transferAmount?: number;

  /**
   * The transfer token symbol
   */
  transferToken?: string;

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
  changeAmount?: number;

  /**
   * The withdraw button props
   */
  transferBtnProps?: ComponentProps<typeof Button>;
}
