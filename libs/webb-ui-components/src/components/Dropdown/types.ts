import {
  DropdownMenuContentProps,
  DropdownMenuProps as RdxDropdownMenuProps,
} from '@radix-ui/react-dropdown-menu';
import { IWebbComponentBase, PropsOf } from '../../types';

import { DropdownMenuProps } from '../DropdownMenu/types';

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
    Pick<DropdownMenuProps, DropdownButtonPickedKeys> {}

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
  isPorttal?: boolean;
}
