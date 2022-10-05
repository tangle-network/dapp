import { DropdownMenuProps as RdxDropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import { PropsOf, WebbComponentBase } from '@webb-dapp/webb-ui-components/types';

import { DropdownMenuProps } from '../DropdownMenu/types';

/**
 * The `Dropdown` props
 */
export interface DropdownProps extends PropsOf<'div'>, WebbComponentBase {}

type DropdownButtonPickedKeys = 'label' | 'icon' | 'size';

/**
 * The `DropdownButton` props
 */
export interface DropdownButtonProps
  extends PropsOf<'button'>,
    WebbComponentBase,
    Pick<DropdownMenuProps, DropdownButtonPickedKeys> {
  dropdownButton?: boolean = true;
}

type DropdownBodyPickedKeys = 'size';

/**
 * The `DropdownBody` props
 */
export interface DropdownBodyProps
  extends PropsOf<'div'>,
    WebbComponentBase,
    Pick<DropdownMenuProps, DropdownBodyPickedKeys> {
  onFocusOutside?: () => Promise<void>;
}
