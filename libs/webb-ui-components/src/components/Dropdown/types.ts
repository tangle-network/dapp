import type {
  DropdownMenuContentProps,
  DropdownMenuProps as RdxDropdownMenuProps,
  DropdownMenuItemProps as RdxDropdownMenuItemProps,
} from '@radix-ui/react-dropdown-menu';
import type { IWebbComponentBase, PropsOf } from '../../types';
import type { DropdownMenuProps } from '../DropdownMenu/types';

/**
 * The `Dropdown` props
 */
export interface DropdownProps extends PropsOf<'div'>, IWebbComponentBase {
  /**
   * The root radix dropdown props
   */
  radixRootProps?: RdxDropdownMenuProps;
}

type DropdownButtonPickedKeys = 'label' | 'icon' | 'size';

/**
 * The `DropdownButton` props
 */
export interface DropdownButtonProps
  extends PropsOf<'button'>,
    IWebbComponentBase,
    Pick<DropdownMenuProps, DropdownButtonPickedKeys> {
  /**
   * If true, the button will be rendered as a full width button
   */
  isFullWidth?: boolean;
}

type DropdownBodyPickedKeys = 'size';

/**
 * The `DropdownBody` props
 */
export interface DropdownBodyProps
  extends IWebbComponentBase,
    Pick<DropdownMenuProps, DropdownBodyPickedKeys>,
    DropdownMenuContentProps {
  /**
   * If true, the dropdown will be rendered as a portal
   * @default true
   */
  isPortal?: boolean;
}

export interface DropdownMenuItemProps
  extends IWebbComponentBase,
    RdxDropdownMenuItemProps {
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
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'normal-case';
}
