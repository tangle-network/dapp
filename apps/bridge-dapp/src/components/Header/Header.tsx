import { useWebContext } from '@webb-tools/api-provider-environment';
import {
  Breadcrumbs,
  BreadcrumbsItem,
  Button,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuTrigger,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useConnectWallet } from '../../hooks';
import { ChainSwitcherButton } from './ChainSwitcherButton';
import { WalletButton } from './WalletButton';
import { HeaderProps } from './types';
import { ContrastTwoLine } from '@webb-tools/icons';

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
    <header className="pt-6 pb-10">
      <div className="flex justify-between max-w-[1160px] h-[40px] mx-auto">
        <Breadcrumbs>
          <NavLink to="/bridge">
            <BreadcrumbsItem
              icon={<ContrastTwoLine width={24} height={24} />}
              className="!pl-0"
            >
              Hubble
            </BreadcrumbsItem>
          </NavLink>
          <BreadcrumbsItem isLast={true}>Bridge</BreadcrumbsItem>
        </Breadcrumbs>

        <div className="flex items-center space-x-2">
          {/** Wallet is actived */}
          {isDisplayNetworkSwitcherAndWalletButton &&
          activeAccount &&
          activeWallet ? (
            <div className="hidden lg:!flex items-center space-x-2">
              <ChainSwitcherButton />
              <WalletButton account={activeAccount} wallet={activeWallet} />
            </div>
          ) : (
            <Button
              isLoading={loading}
              loadingText="Connecting..."
              onClick={handleConnectWalletClick}
              className="hidden lg:!flex justify-center items-center"
            >
              Connect wallet
            </Button>
          )}

          <NavigationMenu>
            <NavigationMenuTrigger />
            {/** TODO: Refactor these links into a config file and make the menu items dynamically based on the config */}
            <NavigationMenuContent
              version={process.env.BRIDGE_VERSION}
              onTestnetClick={() =>
                window.open(
                  'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Ftangle-standalone-archive.webb.tools%2F#/explorer',
                  '_blank'
                )
              }
              onFaucetClick={() => {
                window.open('https://faucet.webb.tools/', '_blank');
              }}
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
