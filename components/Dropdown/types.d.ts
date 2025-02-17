import { DropdownMenuContentProps, DropdownMenuProps as RdxDropdownMenuProps, DropdownMenuItemProps as RdxDropdownMenuItemProps } from '@radix-ui/react-dropdown-menu';
import { IComponentBase, PropsOf, ComponentBase } from '../../types';
/**
 * The `Dropdown` props
 */
export interface DropdownProps extends PropsOf<'div'>, IComponentBase {
    /**
     * The root radix dropdown props
     */
    radixRootProps?: RdxDropdownMenuProps;
}
type DropdownButtonPickedKeys = 'label' | 'icon' | 'size';
/**
 * The `DropdownButton` props
 */
export interface DropdownButtonProps extends PropsOf<'button'>, IComponentBase, Pick<DropdownMenuProps, DropdownButtonPickedKeys> {
    /**
     * If true, the button will be rendered as a full width button
     */
    isFullWidth?: boolean;
    hideChevron?: boolean;
}
type DropdownBodyPickedKeys = 'size';
/**
 * The `DropdownBody` props
 */
export interface DropdownBodyProps extends IComponentBase, Pick<DropdownMenuProps, DropdownBodyPickedKeys>, DropdownMenuContentProps {
    /**
     * If true, the dropdown will be rendered as a portal
     * @default true
     */
    isPortal?: boolean;
}
/**
 * The option list of `DropdownMenu` component
 */
export type DropDownMemuOption = {
    /**
     * The item value and the display text
     */
    value: string;
    /**
     * Item icon
     */
    icon?: React.ReactElement;
};
/**
 * Dropdown Menu component
 */
export interface DropdownMenuProps extends Omit<ComponentBase, 'onChange'> {
    /**
     * The `Dropdown` size
     */
    size?: 'md' | 'sm';
    /**
     * The label to be display, if not provided, the `Dropdown` trigger will display the value property
     */
    label?: string;
    /**
     * The icon before the `Dropdown` label
     */
    icon?: React.ReactElement;
    /**
     * Options array to display
     */
    menuOptions: Array<DropDownMemuOption>;
    /**
     * Current selected value
     */
    value?: string;
    /**
     * Callback function to update the value
     */
    onChange?: (nextValue: string) => void;
}
export interface DropdownMenuItemProps extends IComponentBase, RdxDropdownMenuItemProps {
    /**
     * Handle state if the item is being active
     */
    isActive?: boolean;
    /**
     * The icon displayed on the left before the text
     */
    leftIcon?: React.ReactElement;
    /**
     * The icon displayed on the right
     */
    rightIcon?: React.ReactElement;
    /**
     * The text transform
     * @default 'capitalize'
     */
    textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'normal-case' | '';
}
export interface AccountDropdownBodyProps {
    accountItems: {
        address: string;
        name: string;
        onClick: () => void;
    }[];
    className?: string;
    addressShortenFn?: (address: string) => string;
}
export {};
