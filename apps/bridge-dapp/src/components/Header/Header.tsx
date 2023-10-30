import { useWebContext } from '@webb-tools/api-provider-environment';
import {
  Breadcrumbs,
  BreadcrumbsItem,
  Button,
  ConnectWalletMobileButton,
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
import { ComponentProps, FC, useCallback, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { BREADCRUMBS_RECORD } from '../../constants/breadcrumb';
import useChainsFromRoute from '../../hooks/useChainsFromRoute';
import { useConnectWallet } from '../../hooks/useConnectWallet';
import useSidebarProps from '../../hooks/useSidebarProps';
import ActiveChainDropdown from './ActiveChainDropdown';
import TxProgressDropdown from './TxProgressDropdown';
import { WalletDropdown } from './WalletDropdown';
import { HeaderProps } from './types';

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

  return (
    <header className="flex justify-between py-4">
      <div className="flex items-center gap-2">
        <SideBarMenu
          {...sidebarProps}
          className="lg:hidden"
          overrideContentProps={{ className: 'top-0' }}
        />
        <Breadcrumbs className="hidden md:flex">
          {items.map((item, index) => {
            const preCfgBreadcrumb = BREADCRUMBS_RECORD[item];

            return (
              <NavLink key={index} to={item}>
                <BreadcrumbsItem
                  isLast={index === items.length - 1}
                  icon={preCfgBreadcrumb?.Icon}
                  className="capitalize"
                >
                  {preCfgBreadcrumb?.label ?? item.split('-').join(' ')}
                </BreadcrumbsItem>
              </NavLink>
            );
          })}
        </Breadcrumbs>
      </div>

      <div className="flex items-center space-x-2">
        <TxProgressDropdown />

        <div className="hidden lg:!flex items-center space-x-2">
          <ActiveChainDropdown />
          {isConnecting || loading || !activeWallet || !activeAccount ? (
            isMobile ? (
              <ConnectWalletMobileButton />
            ) : (
              <Button
                isLoading={loading}
                loadingText="Connecting..."
                onClick={() => toggleModal(true, srcTypedChainId ?? undefined)}
                className="hidden lg:!flex justify-center items-center px-6"
              >
                Connect wallet
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
            className="mt-5"
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
