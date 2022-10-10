import { PropsOf, WebbComponentBase } from '@webb-dapp/webb-ui-components/types';

import { InputProps } from '../Input/types';

export interface InputWrapperProps extends WebbComponentBase, PropsOf<'div'> {
  /**
   * The `id` prop for label and input
   * @default "amount"
   */
  id?: string;
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
