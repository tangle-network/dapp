import { useWebContext } from '@webb-tools/api-provider-environment';
import {
  Button,
  Logo,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuTrigger,
} from '@webb-tools/webb-ui-components';
import * as constants from '@webb-tools/webb-ui-components/constants';
import { FC, useCallback, useMemo } from 'react';
import { NavLink } from 'react-router-dom';

import { useConnectWallet } from '../../hooks';
import { ChainSwitcherButton } from './ChainSwitcherButton';
import { WalletButton } from './WalletButton';
import { HeaderProps } from './types';

/**
 * The statistic `Header` for `Layout` container
 */
export const Header: FC<HeaderProps> = () => {
  const { activeAccount, activeWallet, activeChain, loading } = useWebContext();

  const { toggleModal } = useConnectWallet();

  // On connect wallet button click - connect to the default chain(ETH Goerli)
  const handleConnectWalletClick = useCallback(() => {
    toggleModal(true);
  }, [toggleModal]);

  // Boolean to display the network switcher and wallet button
  const isDisplayNetworkSwitcherAndWalletButton = useMemo(
    () => [!loading, activeAccount, activeWallet, activeChain].every(Boolean),
    [activeAccount, activeChain, activeWallet, loading]
  );

  return (
    <header className="py-4 bg-mono-0 dark:bg-mono-180">
      <div className="flex justify-between px-2 max-w-[1160px] h-[40px] mx-auto">
        <NavLink
          to={constants.logoConfig.path}
          className="flex flex-col justify-center"
        >
          <Logo />
        </NavLink>

        <div className="flex items-center space-x-2">
          {/** Wallet is actived */}
          {isDisplayNetworkSwitcherAndWalletButton &&
          activeAccount &&
          activeWallet ? (
            <>
              <ChainSwitcherButton />
              <WalletButton account={activeAccount} wallet={activeWallet} />
            </>
          ) : (
            <Button
              isLoading={loading}
              loadingText="Connecting..."
              onClick={handleConnectWalletClick}
            >
              Connect wallet
            </Button>
          )}

          <NavigationMenu>
            <NavigationMenuTrigger />
            {/** TODO: Refactor these links into a config file and make the menu items dynamically based on the config */}
            <NavigationMenuContent
              onTestnetClick={() =>
                window.open(
                  'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Ftangle-standalone-archive.webb.tools%2F#/explorer',
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
