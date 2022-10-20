import { PropsOf } from '@webb-dapp/webb-ui-components/types';

export interface TokenWithAmountProps extends PropsOf<'div'> {
  /**
   * The token amount to display
   */
  amount?: number | string;

  /**
   * The token 1 symbol to display
   */
  token1Symbol: string;

  /**
   * The token 2 symbol to display (in token-pair case)
   */
  token2Symbol?: string;
}
