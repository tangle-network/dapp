import { PropsOf, WebbComponentBase } from '@webb-dapp/webb-ui-components/types';

export interface TokenSelectorProps extends WebbComponentBase, PropsOf<'button'> {
  /**
   * The chidren must be a token symbol (e.g. eth, dot, ...)
   */
  children: string;
  /**
   * If `true`, the component will display as disable state
   */
  isActive?: boolean;
}
