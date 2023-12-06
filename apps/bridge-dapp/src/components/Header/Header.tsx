import {
  useWebContext,
  useConnectWallet,
} from '@webb-tools/api-provider-environment';
import { WebbLogoIcon } from '@webb-tools/icons';
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
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type FC,
} from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { BREADCRUMBS_RECORD } from '../../constants/breadcrumb';
import useChainsFromRoute from '../../hooks/useChainsFromRoute';

import useSidebarProps from '../../hooks/useSidebarProps';
import ActiveChainDropdown from './ActiveChainDropdown';
import TxProgressDropdown from './TxProgressDropdown';
import { WalletDropdown } from './WalletDropdown';
import { HeaderProps } from './types';
import { ACTION_BUTTON_PROPS } from '../../constants';
import { ConnectWalletMobileContent } from '../ConnectWalletMobileContent';

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

  const sidebarProps = useSidebarProps();

  const breadcrumbItems = useMemo(
    () =>
      items.map((item, index, arr) => {
        const preCfgBreadcrumb = BREADCRUMBS_RECORD[item];
        const href = '/' + arr.slice(0, index + 1).join('/');

        return (
          <NavLink key={index} to={href}>
            <BreadcrumbsItem
              isLast={index === items.length - 1}
              icon={preCfgBreadcrumb?.Icon}
              className="capitalize"
            >
              {preCfgBreadcrumb?.label ??
                (index === 2 && items[1].toLowerCase() === 'transactions'
                  ? 'Tx Detail'
                  : item.split('-').join(' '))}
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
            <ActiveChainDropdown />
            {isConnecting || loading || !activeWallet || !activeAccount ? (
              isMobile ? (
                <ConnectWalletMobileButton
                  title="Try Hubble on Desktop"
                  extraActionButtons={ACTION_BUTTON_PROPS}
                >
                  <ConnectWalletMobileContent />
                </ConnectWalletMobileButton>
              ) : (
                <Button
                  isLoading={loading}
                  loadingText="Connecting..."
                  onClick={() =>
                    toggleModal(true, srcTypedChainId ?? undefined)
                  }
                  className="flex items-center justify-center px-6"
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
