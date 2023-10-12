import { useWebContext } from '@webb-tools/api-provider-environment';
import { ContrastTwoLine } from '@webb-tools/icons';
import {
  Breadcrumbs,
  BreadcrumbsItem,
  Button,
  ChainButton,
  MenuItem,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuTrigger,
  SideBarMenu,
  getHumanFileSize,
} from '@webb-tools/webb-ui-components';
import {
  GITHUB_REQUEST_FEATURE_URL,
  SOCIAL_URLS_RECORD,
  TANGLE_STANDALONE_EXPLORER_URL,
  WEBB_DOCS_URL,
  WEBB_FAUCET_URL,
  WEBB_MKT_URL,
} from '@webb-tools/webb-ui-components/constants';
import {
  ComponentProps,
  FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
            onClick={() => toggleModal(true)}
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
            extraMenuItems={[<ClearCacheMenuItem />]}
          />
        </NavigationMenu>
      </div>
    </header>
  );
};

function ClearCacheMenuItem(): React.ReactElement<
  ComponentProps<typeof MenuItem>,
  typeof MenuItem
> {
  const [storageSize, setStorageSize] = useState<number | undefined>();

  useEffect(() => {
    let isSubscribed = true;

    async function getStorageSize() {
      if (typeof window === 'undefined') {
        return;
      }

      try {
        const { usage } = await window.navigator.storage.estimate();

        if (isSubscribed) {
          setStorageSize(usage);
        }
      } catch {
        // ignore
      }
    }

    getStorageSize();

    return () => {
      isSubscribed = false;
    };
  }, []);

  const handleClearCache = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.clear();
    sessionStorage.clear();

    const cachesKeys = await caches.keys();
    await Promise.all(cachesKeys.map((key) => caches.delete(key)));

    // Reload the page
    window.location.reload();
  }, []);

  return (
    <MenuItem onClick={handleClearCache}>
      Clear cache{' '}
      {typeof storageSize === 'number' ? (
        <i>{`(${getHumanFileSize(storageSize, true)})`}</i>
      ) : (
        ''
      )}
    </MenuItem>
  );
}
