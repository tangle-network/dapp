import { IWebbComponentBase, PropsOf } from '../../types';

export interface TokenSelectorProps extends IWebbComponentBase, PropsOf<'button'> {
  /**
   * The chidren must be a token symbol (e.g. eth, dot, ...)
   */
  children: string;
  /**
   * If `true`, the component will display as disable state
   */
  isActive?: boolean;
}
