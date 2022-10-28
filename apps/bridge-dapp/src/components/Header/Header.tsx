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
            {/** TODO: Refactor these links into a config file and make the menu items dynamically based on the config */}
            <NavigationMenuContent
              onTestnetClick={() =>
                window.open(
                  'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Farana-alpha-1.webb.tools#/explorer',
                  '_blank'
                )
              }
              onHelpCenterClick={() =>
                window.open('https://t.me/webbprotocol', '_blank')
              }
              onRequestFeaturesClick={() =>
                window.open(
                  'https://github.com/webb-tools/webb-dapp/issues/new?assignees=&labels=&template=feature_request.md&title=',
                  '_blank'
                )
              }
              onAboutClick={() =>
                window.open('https://www.webb.tools/', '_blank')
              }
            />
          </NavigationMenu>
        </div>
      </div>
    </header>
  );
};
