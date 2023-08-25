import { IWebbComponentBase, PropsOf, TokenType } from '../../types';

export interface TokenSelectorProps
  extends IWebbComponentBase,
    Omit<PropsOf<'button'>, 'disabled'> {
  /**
   * The chidren must be a token symbol (e.g. eth, dot, ...)
   * for rendering the token icon and displaying.
   * If not provided, the component will display the placeholder
   */
  children?: string;

  /**
   * The token type
   * @default 'unshielded'
   */
  tokenType?: TokenType;

  /**
   * If `true`, the component will display as disable state
   */
  isActive?: boolean;

  /**
   * If `true`, the component will display as disable state
   */
  isDisabled?: boolean;

  /**
   * The placeholder for the component
   * when the children is not provided
   * @default 'Select token'
   */
  placeHolder?: string;
}
