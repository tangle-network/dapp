import {
  Button,
  Logo,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuTrigger,
} from '@webb-tools/webb-ui-components';
import * as constants from '@webb-tools/webb-ui-components/constants';
import { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { HeaderProps } from './types';

/**
 * The statistic `Header` for `Layout` container
 */
export const Header: FC<HeaderProps> = () => {
  return (
    <header className="bg-mono-0 dark:bg-mono-180">
      <div className="flex items-center justify-between p-4">
        <NavLink to={constants.logoConfig.path}>
          <Logo />
        </NavLink>

        <div className="flex items-center space-x-2">
          <Button>Connect Wallet</Button>

          <NavigationMenu>
            <NavigationMenuTrigger />
            <NavigationMenuContent />
          </NavigationMenu>
        </div>
      </div>
    </header>
  );
};
