import { useWebContext } from '@webb-tools/api-provider-environment';
import { ContrastTwoLine, WebbLogoIcon } from '@webb-tools/icons';
import {
  Breadcrumbs,
  BreadcrumbsItem,
  Button,
  ConnectWalletMobileButton,
  Logo,
  MenuItem,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuTrigger,
  SideBarMenu,
  getHumanFileSize,
  useCheckMobile,
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
  type ComponentProps,
  type FC,
  useCallback,
  useEffect,
  useState,
  useMemo,
} from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import sidebarProps from '../../constants/sidebar';
import useChainsFromRoute from '../../hooks/useChainsFromRoute';
import { useConnectWallet } from '../../hooks/useConnectWallet';
import TxProgressDropdown from './TxProgressDropdown';
import { WalletDropdown } from './WalletDropdown';
import { HeaderProps } from './types';
import ChainButton from './ChainButton';

/**
 * The statistic `Header` for `Layout` container
 */
export const Header: FC<HeaderProps> = () => {
  const { activeAccount, activeWallet, loading, isConnecting } =
    useWebContext();

  const { toggleModal } = useConnectWallet();
  const { srcTypedChainId } = useChainsFromRoute();

  const { isMobile } = useCheckMobile();

  const location = useLocation();

  const items = location.pathname.split('/').filter((item) => item !== '');

  const breadcrumbItems = useMemo(
    () =>
      items.map((item, index) => {
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
      }),
    [items]
  );

  return (
    <div>
      <header className="flex justify-between py-6">
        <div className="flex items-center gap-2">
          <SideBarMenu
            {...sidebarProps}
            className="lg:hidden"
            overrideContentProps={{ className: 'top-0' }}
          />

          {/* Show Logo with name on table */}
          <Logo className="hidden md:block lg:hidden" />

          {/* Show Logo without name on mobile */}
          <WebbLogoIcon className="md:hidden" size="lg" />

          <Breadcrumbs className="hidden lg:flex">
            {breadcrumbItems}
          </Breadcrumbs>
        </div>

        <div className="flex items-center space-x-2">
          <TxProgressDropdown />

          <div className="flex items-center space-x-2">
            <ChainButton />
            {isConnecting || loading || !activeWallet || !activeAccount ? (
              isMobile ? (
                <ConnectWalletMobileButton />
              ) : (
                <Button
                  isLoading={loading}
                  loadingText="Connecting..."
                  onClick={() =>
                    toggleModal(true, srcTypedChainId ?? undefined)
                  }
                  className="flex justify-center items-center px-6"
                >
                  Connect
                </Button>
              )
            ) : (
              <WalletDropdown account={activeAccount} wallet={activeWallet} />
            )}
          </div>

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

      <Breadcrumbs className="lg:!hidden">{breadcrumbItems}</Breadcrumbs>
    </div>
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
