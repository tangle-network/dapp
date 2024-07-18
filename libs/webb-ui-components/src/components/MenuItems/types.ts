import { DropdownMenuItemProps } from '@radix-ui/react-dropdown-menu';

import { IWebbComponentBase } from '../../types';

/**
 * `MenuItem` component's props
 */
export interface MenuItemProps
  extends IWebbComponentBase,
    DropdownMenuItemProps {
  /**
   * The icon displayed before the text
   */
  startIcon?: React.ReactElement;

  /**
   * The icon displayed after the text
   */
  icon?: React.ReactElement;

  /**
   * The text transform
   * @default 'capitalize'
   */
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'normal-case';
}
