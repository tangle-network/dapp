import { ReactElement, ReactNode } from '../../../../../node_modules/react';
import { IComponentBase, PropsOf, TokenType } from '../../types';
export interface TokenSelectorProps extends IComponentBase, Omit<PropsOf<'button'>, 'disabled'> {
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
