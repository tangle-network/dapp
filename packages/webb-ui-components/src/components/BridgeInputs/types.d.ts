import { PropsOf, WebbComponentBase } from '@webb-dapp/webb-ui-components/types';

export interface InputWrapperProps extends WebbComponentBase, PropsOf<'div'> {}

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

export interface ChainInputProps extends InputWrapperProps {
  /**
   * The chain symbol (e.g. eth, dot, ...)
   * Will display `select chain` when to chain provided
   */
  chain?: ChainType;
  /**
   * The chain type
   * @type "source" | "dest"
   */
  chainType: 'source' | 'dest';
}
