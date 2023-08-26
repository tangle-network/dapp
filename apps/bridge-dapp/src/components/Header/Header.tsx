import { useWebContext } from '@webb-tools/api-provider-environment';
import { ContrastTwoLine } from '@webb-tools/icons';
import {
  Breadcrumbs,
  BreadcrumbsItem,
  Button,
  ChainButton,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuTrigger,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { BRIDGE_PATH, SELECT_SOURCE_CHAIN_PATH } from '../../constants';
import { useConnectWallet, useNavigateWithPersistParams } from '../../hooks';
import { WalletDropdown } from './WalletDropdown';
import { HeaderProps } from './types';
import TxProgressDropdown from './TxProgressDropdown';

/**
 * The statistic `Header` for `Layout` container
 */
export const Header: FC<HeaderProps> = () => {
  const { activeAccount, activeWallet, activeChain, loading } = useWebContext();

  const navigate = useNavigateWithPersistParams();

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

  const location = useLocation();

  const items = location.pathname.split('/').filter((item) => item !== '');

  return (
    <header className="flex justify-between py-4">
      <Breadcrumbs>
        <NavLink to="/bridge">
          <BreadcrumbsItem
            icon={<ContrastTwoLine width={24} height={24} />}
            className="!pl-0"
          >
            Hubble
          </BreadcrumbsItem>
        </NavLink>

        {items.map((item, index) => (
          <BreadcrumbsItem
            key={index}
            isLast={index === items.length - 1}
            className="capitalize"
          >
            {item.split('-').join(' ')}
          </BreadcrumbsItem>
        ))}
      </Breadcrumbs>

      <div className="flex items-center space-x-2">
        <TxProgressDropdown />

        {/** Wallet is actived */}
        {isDisplayNetworkSwitcherAndWalletButton &&
        activeAccount &&
        activeWallet &&
        activeChain ? (
          <div className="hidden lg:!flex items-center space-x-2">
            <ChainButton
              chain={activeChain}
              status="success"
              onClick={() =>
                navigate(`/${BRIDGE_PATH}/${SELECT_SOURCE_CHAIN_PATH}`)
              }
            />
            <WalletDropdown account={activeAccount} wallet={activeWallet} />
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
    </header>
  );
};
