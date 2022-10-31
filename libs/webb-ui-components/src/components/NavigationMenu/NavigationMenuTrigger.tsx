import { ThreeDotsVerticalIcon } from '@webb-tools/icons';
import { forwardRef } from 'react';

import { DropdownBasicButton } from '../Dropdown/DropdownBasicButton';
import { NavigationMenuTriggerProps } from './types';

/**
 * The navigation menu trigger, must use inside the `NavigationMenu` component
 */
export const NavigationMenuTrigger = forwardRef<
  HTMLButtonElement,
  NavigationMenuTriggerProps
>((props, ref) => {
  return (
    <DropdownBasicButton {...props} ref={ref}>
      <ThreeDotsVerticalIcon size="lg" />
    </DropdownBasicButton>
  );
});
