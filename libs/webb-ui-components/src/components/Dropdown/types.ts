import { DropdownMenuContentProps, DropdownMenuProps as RdxDropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import { PropsOf, WebbComponentBase, IWebbComponentBase } from '../../types';

import { DropdownMenuProps } from '../DropdownMenu/types';

/**
 * The `Dropdown` props
 */
export interface DropdownProps extends PropsOf<'div'>, IWebbComponentBase {}

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
    DropdownMenuContentProps {}
