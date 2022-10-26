import { BookOpenLineIcon, FlaskLineIcon, HelpLineIcon, InformationLine } from '@webb-dapp/webb-ui-components/icons';
import { ComponentProps, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { Collapsible, CollapsibleButton, CollapsibleContent } from '../Collapsible';
import { DropdownBody } from '../Dropdown';
import { MenuItem } from '../MenuItem/MenuItem';
import { ThemeSwitcherMenuItem } from '../ThemeSwitcher/';
import { NavigationMenuContentProps } from './types';

/**
 * The navigation menu content, must use inside the `NavigationMenu` component
 */
export const NavigationMenuContent = forwardRef<HTMLDivElement, NavigationMenuContentProps>(
  (
    {
      className,
      onAboutClick,
      onDevelopmentClick,
      onHelpCenterClick,
      onRequestFeaturesClick,
      onTestnetClick,
      ...props
    },
    ref
  ) => {
    return (
      <DropdownBody {...props} className={twMerge('pt-2 pb-4 mt-6 w-full min-w-[200px]', className)} ref={ref}>
        <ThemeSwitcherMenuItem />

        <Collapsible>
          <CollapsibleButton>Network Settings</CollapsibleButton>
          <CollapsibleContent className='p-0'>
            <MenuItem onClick={onTestnetClick}>Testnet</MenuItem>
            <MenuItem onClick={onDevelopmentClick}>Development</MenuItem>
          </CollapsibleContent>
        </Collapsible>

        <MenuItem icon={<HelpLineIcon size='lg' />} onClick={onHelpCenterClick}>
          Help Center
        </MenuItem>

        <MenuItem icon={<FlaskLineIcon size='lg' />} onClick={onRequestFeaturesClick}>
          Request Features
        </MenuItem>

        <MenuItem
          icon={<BookOpenLineIcon size='lg' />}
          onClick={() => {
            window.open('https://docs.webb.tools', '_blank');
          }}
        >
          Docs
        </MenuItem>

        <MenuItem icon={<InformationLine size='lg' />} onClick={onAboutClick}>
          About
        </MenuItem>
      </DropdownBody>
    );
  }
);
