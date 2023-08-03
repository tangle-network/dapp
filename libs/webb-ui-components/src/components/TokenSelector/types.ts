import { IWebbComponentBase, PropsOf } from '../../types';

export interface TokenSelectorProps
  extends IWebbComponentBase,
    PropsOf<'button'> {
  /**
   * The chidren must be a token symbol (e.g. eth, dot, ...)
   * for rendering the token icon and displaying.
   * If not provided, the component will display the placeholder
   */
  children?: string;

  /**
   * If `true`, the component will display as disable state
   */
  isActive?: boolean;
}
