import { PropsOf } from '../../types';

export interface ChainsRingProps extends PropsOf<'div'> {
  /**
   * The active bridge chain, the length must less than 8
   */
  activeChains: string[];

  /**
   * The source chain name
   */
  sourceChain?: string;

  /**
   * The destination chain name
   */
  destChain?: string;

  /**
   * The transation amount
   */
  amount?: number | string;

  /**
   * The token pair string to display
   */
  tokenPairString?: string;

  /**
   * The source chain label
   */
  sourceLabel?: string;

  /**
   * The destination chain label
   */
  destLabel?: string;
}
