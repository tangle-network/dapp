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
  SideBarMenu,
} from '@webb-tools/webb-ui-components';
import {
  GITHUB_REQUEST_FEATURE_URL,
  TANGLE_STANDALONE_EXPLORER_URL,
  WEBB_FAUCET_URL,
  WEBB_MKT_URL,
  SOCIAL_URLS_RECORD,
  WEBB_DOCS_URL,
} from '@webb-tools/webb-ui-components/constants';
import { FC, useCallback, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { BRIDGE_PATH, SELECT_SOURCE_CHAIN_PATH } from '../../constants';
import sidebarProps from '../../constants/sidebar';
import { useConnectWallet, useNavigateWithPersistParams } from '../../hooks';
import TxProgressDropdown from './TxProgressDropdown';
import { WalletDropdown } from './WalletDropdown';
import { HeaderProps } from './types';

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
      <div className="flex items-center gap-2">
        <SideBarMenu
          {...sidebarProps}
          className="lg:hidden"
          overrideContentProps={{ className: 'top-0' }}
        />
        <Breadcrumbs>
          {items.map((item, index) => {
            return (
              <NavLink key={index} to={'/'}>
                <BreadcrumbsItem
                  isLast={index === items.length - 1}
                  icon={index === 0 ? <ContrastTwoLine size="lg" /> : undefined}
                  className="capitalize"
                >
                  {index === 0 ? `Hubble ${item}` : item.split('-').join(' ')}
                </BreadcrumbsItem>
              </NavLink>
            );
          })}
        </Breadcrumbs>
      </div>

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
            onDocsClick={() => window.open(WEBB_DOCS_URL, '_blank')}
            onTestnetClick={() =>
              window.open(TANGLE_STANDALONE_EXPLORER_URL, '_blank')
            }
            onFaucetClick={() => {
              window.open(WEBB_FAUCET_URL, '_blank');
            }}
            onHelpCenterClick={() =>
              window.open(SOCIAL_URLS_RECORD.telegram, '_blank')
            }
            onRequestFeaturesClick={() =>
              window.open(GITHUB_REQUEST_FEATURE_URL, '_blank')
            }
            onAboutClick={() => window.open(WEBB_MKT_URL, '_blank')}
          />
        </NavigationMenu>
      </div>
    </header>
  );
};
