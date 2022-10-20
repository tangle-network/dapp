import { PropsOf } from '@webb-dapp/webb-ui-components/types';

export type TokenRingValue = 'eth' | 'dot' | 'avax' | 'ksm' | 'one' | 'arbitrum' | 'op' | 'matic';

export interface TokensRingProps extends PropsOf<'div'> {
  /**
   * The source (or from) chain
   */
  sourceChain?: TokenRingValue;

  /**
   * The destination (or to) chain
   */
  destChain?: TokenRingValue;

  /**
   * The transaction amount
   */
  amount?: number | string;

  /**
   * The token pair to display
   */
  tokenPairString?: string;

  /**
   * The source chain label
   * @default "source"
   */
  sourceLabel?: string;

  /**
   * The destiantion chain label
   * @default "destination"
   */
  destLabel?: string;
}
