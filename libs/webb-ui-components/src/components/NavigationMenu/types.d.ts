import { ComponentProps } from 'react';

import {
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
  DropdownMenuItem,
} from '../Dropdown';

export interface NavigationMenuProps extends ComponentProps<typeof Dropdown> {}

export interface NavigationMenuContentProps
  extends ComponentProps<typeof DropdownBody> {
  /**
   * The callback when user hits testnet menu item
   */
  onTestnetClick?: ComponentProps<typeof DropdownMenuItem>['onClick'];

  /**
   * The callback when user hits development menu item
   */
  onDevelopmentClick?: ComponentProps<typeof DropdownMenuItem>['onClick'];

  /**
   * The callback when user hits help center menu item
   */
  onHelpCenterClick?: ComponentProps<typeof DropdownMenuItem>['onClick'];

  /**
   * The callback when user hits request features menu item
   */
  onRequestFeaturesClick?: ComponentProps<typeof DropdownMenuItem>['onClick'];

  /**
   * The callback when user hits about menu item
   */
  onAboutClick?: ComponentProps<typeof DropdownMenuItem>['onClick'];

  /**
   * The app version
   */
  version?: string;
}

export interface NavigationMenuTriggerProps
  extends ComponentProps<typeof DropdownBasicButton> {}
