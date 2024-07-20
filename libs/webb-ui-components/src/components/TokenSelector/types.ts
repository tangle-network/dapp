import type { ReactElement, ReactNode } from 'react';
import type { IWebbComponentBase, PropsOf, TokenType } from '../../types';

export interface TokenSelectorProps
  extends IWebbComponentBase,
    Omit<PropsOf<'button'>, 'disabled'> {
  Icon?: ReactElement;

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
  placeholder?: ReactNode;

  /**
   * Boolean indicate to render the dropdown chevron icon
   * @default true
   */
  isDropdown?: boolean;
}
