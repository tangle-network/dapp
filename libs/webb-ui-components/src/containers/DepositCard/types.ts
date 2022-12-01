import { ComponentProps } from 'react';
import { PropsOf } from '../../types';

import { AmountInput, Button, ChainInput, TokenInput } from '../../components';

export interface DepositCardProps extends PropsOf<'div'> {
  /**
   * The source chain props, passed into the `ChainInput` component
   */
  sourceChainProps?: ComponentProps<typeof ChainInput>;

  /**
   * The token input props, passed into the `TokenInput` component
   */
  tokenInputProps?: ComponentProps<typeof TokenInput>;

  /**
   * The destination chain props, passed into the `ChainInput` component
   */
  destChainProps?: ComponentProps<typeof ChainInput>;

  /**
   * The amount input props, passed into the `AmountInput` component
   */
  amountInputProps?: ComponentProps<typeof AmountInput>;

  /**
   *
   */
  bridgingTokenProps?: Pick<
    ComponentProps<typeof TokenInput>,
    'onClick' | 'token'
  >;

  /**
   * The deposit token/pair value (e.g. WebbETH/WETH)
   */
  token?: string;

  /**
   * The fee percentage based on the amount
   */
  feePercentage?: number;

  /**
   * The fee token to display after the fee value
   */
  feeToken?: string;

  /**
   * The deposit and connect wallet button props
   */
  buttonProps?: ComponentProps<typeof Button>;
}
