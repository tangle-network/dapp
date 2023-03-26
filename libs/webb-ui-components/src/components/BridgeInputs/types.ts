import { PropsOf, IWebbComponentBase } from '../../types';
import { ComponentProps, ReactElement } from 'react';

import { AmountMenu } from '../AmountMenu';
import { InputProps } from '../Input/types';
import { TitleWithInfo } from '../TitleWithInfo';
import { AvatarProps } from '../Avatar';

export interface InputWrapperProps extends IWebbComponentBase {
  /**
   * The `id` prop for label and input
   * @default "amount"
   */
  id?: string;

  /**
   * Used to override the default title of an input
   */
  title?: string;

  /**
   * The tooltip info
   */
  info?: ComponentProps<typeof TitleWithInfo>['info'];
}

export interface InputWrapperComponentProps
  extends InputWrapperProps,
    PropsOf<'div'> {}

/**
 * The chain type for chain input
 */
export type ChainType = {
  /**
   * The chain name
   */
  name: string;
};

/**
 * The token type for token input
 */
export type TokenType = {
  /**
   * The token symbol to display token logo
   */
  symbol: string;

  /**
   * The token balance
   */
  balance?: number | string;

  /**
   * Token token balance in usd
   */
  balanceInUsd?: number | string;

  /**
   * The token composition if the token is a pool token
   */
  tokenComposition?: string[];

  /**
   * The callback when user clicks on the token
   */
  onTokenClick?: (symbol: string) => void;
};

/**
 * The asset type for shielded asset input
 */
export type PoolAssetType = {
  /**
   * The symbol of the pool (bridge, fungible) token
   */
  symbol: string;

  /**
   * The token balance
   */
  balance?: number | string;

  /**
   * Token token balance in usd
   */
  balanceInUsd?: number | string;
};

export interface ChainInputProps extends InputWrapperProps {
  /**
   * The chain type
   * Will display `select chain` when the chain not provided
   */
  chain?: ChainType;

  /**
   * The chain type
   * @type "source" | "dest"
   */
  chainType: 'source' | 'dest';
}

export interface ChainInputComponentProps
  extends ChainInputProps,
    PropsOf<'div'> {}

export interface TokenInputProps extends InputWrapperProps {
  /**
   * The token token
   * Will display `select token` when the token not provided
   */
  token?: TokenType;
}

export interface TokenInputComponentProps
  extends TokenInputProps,
    PropsOf<'div'> {}

export interface AmountInputComponentProps extends InputWrapperComponentProps {
  /**
   * The `id` prop for label and input
   * @default "amount"
   */
  id?: string;

  /**
   * The tooltip info
   */
  info?: string;

  /**
   * The amount value
   */
  amount?: InputProps['value'];

  /**
   * The error message to display
   */
  errorMessage?: string;

  /**
   * Callback function to control the amount value
   */
  onAmountChange?: InputProps['onChange'];

  /**
   * Callback function when the max button is clicked
   */
  onMaxBtnClick?: PropsOf<'button'>['onClick'];

  /**
   * The amount menu props to pass into the AmountMenu component
   */
  amountMenuProps?: ComponentProps<typeof AmountMenu>;

  /**
   * Override props of input element
   */
  overrideInputProps?: Omit<InputProps, 'id'>;

  /**
   * Disable the input
   */
  isDisabled?: boolean;
}

export interface FixedAmountProps
  extends Omit<InputWrapperComponentProps, 'onChange'> {
  /**
   * The `id` prop for label and input
   * @default "amount"
   */
  id?: string;

  /**
   * The fixed number list to display
   */
  values: number[];

  /**
   * The value prop
   */
  value?: number;

  /**
   * The callback function to control the component
   */
  onChange?: (nextVal: number) => void;

  /**
   * The amount menu props to pass into the AmountMenu component
   */
  amountMenuProps?: ComponentProps<typeof AmountMenu>;

  /**
   * Disable the input
   */
  isDisabled?: boolean;
}

export interface RecipientInputProps
  extends Omit<InputWrapperComponentProps, 'onChange'> {
  /**
   * The input value
   */
  value?: InputProps['value'];

  /**
   * Callback function to control the input value
   */
  onChange?: (nextValue: string) => void;

  /**
   * The amount menu props to pass into the AmountMenu component
   */
  amountMenuProps?: ComponentProps<typeof AmountMenu>;

  /**
   * The error message to display
   */
  errorMessage?: string;

  /**
   * Override props of input element
   */
  overrideInputProps?: Omit<InputProps, 'id'>;
  /**
   *
   * set valid state of the input
   * */
  isValidSet?(valid: boolean): void;
}

export interface ShieldedAssetInputProps extends InputWrapperProps {
  asset?: PoolAssetType;
}

export interface ShieldedAssetInputComponentProps
  extends ShieldedAssetInputProps,
    PropsOf<'div'> {}

export interface RelayerInputProps extends InputWrapperComponentProps {
  /**
   * The relayer address to display
   */
  relayerAddress?: string;

  /**
   * The external url of a relayer
   */
  externalLink?: string;

  /**
   * Relayer icon theme (use for Identicon theme)
   * @default 'polkadot'
   */
  iconTheme?: AvatarProps['theme'];
}

export interface InfoItemProps extends PropsOf<'div'> {
  /**
   * The left text props (props of TitleWithInfo component)
   */
  leftTextProps: ComponentProps<typeof TitleWithInfo>;

  /**
   * Right content
   */
  rightContent?: string | ReactElement;
}
