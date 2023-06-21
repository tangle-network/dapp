import {
  BookOpenLineIcon,
  FlaskLineIcon,
  HelpLineIcon,
  InformationLine,
  FaucetIcon,
} from '@webb-tools/icons';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../../typography/Typography';

import {
  Collapsible,
  CollapsibleButton,
  CollapsibleContent,
} from '../Collapsible';
import { DropdownBody } from '../Dropdown';
import { MenuItem } from '../MenuItem/MenuItem';
import { ThemeSwitcherMenuItem } from '../ThemeSwitcher/';
import { NavigationMenuContentProps } from './types';

/**
 * The navigation menu content, must use inside the `NavigationMenu` component
 */
export const NavigationMenuContent = forwardRef<
  HTMLDivElement,
  NavigationMenuContentProps
>(
  (
    {
      className,
      onAboutClick,
      onDevelopmentClick,
      onFaucetClick,
      onHelpCenterClick,
      onRequestFeaturesClick,
      onTestnetClick,
      version,
      ...props
    },
    ref
  ) => {
    return (
      <DropdownBody
        {...props}
        className={twMerge(
          'pt-2 mt-6 w-full min-w-[200px]',
          !version ? 'pb-2' : '',
          className
        )}
        ref={ref}
      >
        <ThemeSwitcherMenuItem />

        <Collapsible>
          <CollapsibleButton>Network Settings</CollapsibleButton>
          <CollapsibleContent className="p-0">
            <MenuItem onClick={onTestnetClick}>Testnet</MenuItem>
            <MenuItem onClick={onDevelopmentClick}>Development</MenuItem>
          </CollapsibleContent>
        </Collapsible>

        <NavigationMenuDivider />

        <MenuItem icon={<FaucetIcon size="lg" />} onClick={onFaucetClick}>
          Faucet
        </MenuItem>

        <MenuItem icon={<HelpLineIcon size="lg" />} onClick={onHelpCenterClick}>
          Help Center
        </MenuItem>

        <NavigationMenuDivider />

        <MenuItem
          icon={<FlaskLineIcon size="lg" />}
          onClick={onRequestFeaturesClick}
        >
          Request Features
        </MenuItem>

        <MenuItem
          icon={<BookOpenLineIcon size="lg" />}
          onClick={() => {
            window.open('https://docs.webb.tools', '_blank');
          }}
        >
          Docs
        </MenuItem>

        <MenuItem icon={<InformationLine size="lg" />} onClick={onAboutClick}>
          About
        </MenuItem>

        {/** Bottom version */}
        {version && (
          <div className="px-4 pt-1.5 pb-2">
            <Typography
              variant="body4"
              ta="right"
              className="text-mono-100 dark:text-mono-40"
            >
              {version.toLowerCase().startsWith('v') ? version : `v${version}`}
            </Typography>
          </div>
        )}
      </DropdownBody>
    );
  }
);

const NavigationMenuDivider = () => {
  return <div className="border-b border-mono-80 dark:border-mono-120" />;
};
