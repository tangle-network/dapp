import { PropsOf, WebbComponentBase } from '@webb-dapp/webb-ui-components/types';
import { ComponentProps, ReactElement } from 'react';

import { InputProps } from '../Input/types';
import { TitleWithInfo } from '../TitleWithInfo';

export interface InputWrapperProps extends WebbComponentBase, PropsOf<'div'> {
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
  info?: string;
}

/**
 * The chain type for chain input
 */
export type ChainType = {
  /**
   * The chain name
   */
  name: string;
  /**
   * The token symbol to display of the chain
   */
  symbol: string;
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
};

/**
 * The asset type for shielded asset input
 */
export type AssetType = {
  /**
   * The symbol of the first token
   */
  token1Symbol: string;

  /**
   * The symbol of the second token
   */
  token2Symbol: string;

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

export interface TokenInputProps extends InputWrapperProps {
  /**
   * The token token
   * Will display `select token` when the token not provided
   */
  token?: TokenType;
}

export interface AmountInputProps extends InputWrapperProps {
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
   * Callback function to control the amount value
   */
  onAmountChange?: InputProps['onChange'];

  /**
   * Callback function when the max button is clicked
   */
  onMaxBtnClick?: PropsOf<'button'>['onClick'];
}

export interface FixedAmountProps extends InputWrapperProps {
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
}

export interface RecipientInputProps extends InputWrapperProps {
  /**
   * The input value
   */
  value?: InputProps['value'];
  /**
   * Callback function to control the input value
   */
  onChange?: InputProps['onChange'];
}

export interface ShieldedAssetInputProps extends InputWrapperProps {
  asset?: AssetType;
}

export interface RelayerInputProps extends InputWrapperProps {
  /**
   * The relayer address to display
   */
  relayerAddress?: string;
  /**
   * The external url of a relayer
   */
  externalLink?: string;
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
