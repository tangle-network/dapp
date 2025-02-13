import { PropsOf } from '../../types';

export interface TokenPairIconsProps extends PropsOf<'div'> {
  /**
   * The first token symbol to display
   */
  token1Symbol: string;

  /**
   * The second token symbol to display
   */
  token2Symbol: string;

  /**
   * The chain name to display
   */
  chainName?: string;
}
