import ConnectWalletButton from '@tangle-network/tangle-shared-ui/components/ConnectWalletButton';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import {
  useIndexerStatus,
  type DataSource,
} from '@tangle-network/tangle-shared-ui/context/IndexerStatusContext';
import createCustomNetwork from '@tangle-network/tangle-shared-ui/utils/createCustomNetwork';
import {
  Alert,
  ChainIcon,
  MoonLine,
  SettingsFillIcon,
  SunLine,
  Spinner,
  StatusIndicator,
} from '@tangle-network/icons';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@tangle-network/sandbox-ui/primitives';
import { ComponentProps, useCallback, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { twMerge } from 'tailwind-merge';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import TxHistoryDrawer from './TxHistoryDrawer';
import {
  Network,
  NetworkId,
  TANGLE_CLOUD_NETWORKS,
} from '../constants/networks';

export default function Header({
  className,
  theme,
  onThemeChange,
  ...props
}: ComponentProps<'header'> & {
  theme: 'dark' | 'light';
  onThemeChange: (theme: 'dark' | 'light') => void;
}) {
  const pathname = useLocation().pathname;
  const breadcrumbs = useMemo(() => getHeaderBreadcrumbs(pathname), [pathname]);
  const hasContextualConnect =
    pathname.startsWith('/rewards') ||
    pathname.startsWith('/earnings') ||
    pathname.startsWith('/instances');

  return (
    <header
      className={twMerge(
        'tangle-cloud-topbar fixed top-0 right-0 left-0 z-40 flex h-14 items-center justify-between gap-4 border-b border-border bg-[var(--bg-elevated)]/85 px-4 font-sans text-[13px] tracking-tight backdrop-blur-md lg:left-16 lg:px-8',
        className,
      )}
      {...props}
    >
      {/* Topbar left slot reserved for future global controls (search, branch
       * selector, etc.). Breadcrumbs were removed: the sidebar already shows
       * the active section, and the page H1 (PageHeader) names the leaf —
       * the `Cloud / Blueprints / Details`-style breadcrumb was double
       * labeling without conveying new information, and reading the leaf
       * "Details" wasn't actually useful navigation. */}
      <div className="ml-12 flex min-w-0 flex-1 items-center gap-2 sm:ml-0" />
      {/* Kept for potential future use; intentionally unread so the lint
       * doesn't yell about the unused memo. */}
      <span hidden aria-hidden>
        {breadcrumbs.length}
      </span>

      <div className="flex shrink-0 items-center justify-end gap-2">
        <div className="hidden sm:block">
          <TxHistoryDrawer />
        </div>

        <CloudConnectionStatusButton />

        <CloudNetworkSelector networks={TANGLE_CLOUD_NETWORKS} />

        <ThemeToggle theme={theme} onThemeChange={onThemeChange} />

        {!hasContextualConnect && (
          <ConnectWalletButton className="tangle-cloud-wallet-action" />
        )}
      </div>
    </header>
  );
}

const getHeaderBreadcrumbs = (pathname: string): string[] => {
  if (pathname === '/blueprints/create')
    return ['Cloud', 'Blueprints', 'Create'];
  if (pathname === '/blueprints/manage')
    return ['Cloud', 'Blueprints', 'Manage'];

  if (pathname.startsWith('/blueprints/') && pathname.endsWith('/deploy')) {
    return ['Cloud', 'Blueprints', 'Instance checkout'];
  }

  if (pathname.startsWith('/blueprints/') && pathname.includes('/services/')) {
    return ['Cloud', 'Blueprints', 'Service'];
  }

  if (pathname.startsWith('/blueprints/') && pathname !== '/blueprints') {
    return ['Cloud', 'Blueprints', 'Details'];
  }

  if (pathname.startsWith('/blueprints')) return ['Cloud', 'Blueprints'];
  if (pathname === '/operators/manage') return ['Cloud', 'Operators', 'Manage'];
  if (pathname.startsWith('/operators')) return ['Cloud', 'Operators'];
  if (pathname === '/payments/credits') return ['Cloud', 'Payments', 'Credits'];
  if (pathname === '/payments/pool')
    return ['Cloud', 'Payments', 'Shielded pool'];
  if (pathname.startsWith('/rewards')) return ['Cloud', 'Rewards'];
  if (pathname.startsWith('/earnings')) return ['Cloud', 'Earnings'];
  if (pathname.startsWith('/services/'))
    return ['Cloud', 'Instances', 'Service'];
  if (pathname.startsWith('/instances')) return ['Cloud', 'Instances'];

  return ['Tangle Cloud'];
};

function ThemeToggle({
  theme,
  onThemeChange,
}: {
  theme: 'dark' | 'light';
  onThemeChange: (theme: 'dark' | 'light') => void;
}) {
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
      onClick={() => onThemeChange(nextTheme)}
      className="h-11 w-11 border-border bg-muted/30 p-0 text-foreground hover:bg-muted"
    >
      {theme === 'dark' ? <SunLine size="lg" /> : <MoonLine size="lg" />}
    </Button>
  );
}

type StatusVariant = 'success' | 'warning' | 'error' | 'info';

const getStatusVariant = (
  isWalletConnected: boolean,
  dataSource: DataSource,
  isCheckingHealth: boolean,
): StatusVariant => {
  if (isCheckingHealth) return 'info';
  if (!isWalletConnected) return 'warning';
  if (dataSource === 'graphql') return 'success';
  if (dataSource === 'onchain') return 'warning';
  return 'error';
};

function CloudConnectionStatusButton() {
  const { isConnected: isWalletConnected, isConnecting } = useAccount();
  const { dataSource, isCheckingHealth, errorMessage } = useIndexerStatus();
  const isLoading = isConnecting || isCheckingHealth;
  const variant = getStatusVariant(
    isWalletConnected,
    dataSource,
    isCheckingHealth,
  );

  const title = isLoading
    ? 'Checking network connection'
    : !isWalletConnected
      ? 'Wallet not connected'
      : dataSource === 'graphql'
        ? 'Connected'
        : dataSource === 'onchain'
          ? 'Limited mode'
          : 'Connection issue';

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={title}
      title={errorMessage ? `${title}: ${errorMessage}` : title}
      className="h-11 w-11 border-border bg-muted/30 p-0 text-foreground hover:bg-muted"
    >
      {isLoading ? (
        <Spinner size="md" />
      ) : (
        <StatusIndicator
          variant={variant}
          size={16}
          animated={variant === 'warning' || variant === 'error'}
        />
      )}
    </Button>
  );
}

function CloudNetworkSelector({ networks }: { networks: Network[] }) {
  const { isConnecting: isWalletConnecting, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const network = useNetworkStore((store) => store.network2);
  const setNetwork = useNetworkStore((store) => store.setNetwork);
  const [switchingNetworkId, setSwitchingNetworkId] = useState<
    NetworkId | null | 'custom'
  >(null);
  const [customRpcEndpoint, setCustomRpcEndpoint] = useState('');

  const isWrongEvmNetwork = useMemo(() => {
    if (!isConnected || !network?.evmChainId) {
      return false;
    }

    return network.evmChainId !== chainId;
  }, [chainId, isConnected, network?.evmChainId]);

  const isLoading = isWalletConnecting || isSwitchingChain;
  const networkName = isLoading ? 'Connecting' : (network?.name ?? 'Network');

  const handleNetworkChange = useCallback(
    async (newNetwork: Network) => {
      setSwitchingNetworkId(newNetwork.id);

      try {
        if (isConnected && newNetwork.evmChainId && switchChain) {
          switchChain({ chainId: newNetwork.evmChainId });
        }

        setNetwork(newNetwork);
      } finally {
        setSwitchingNetworkId(null);
      }
    },
    [isConnected, setNetwork, switchChain],
  );

  const handleCustomNetwork = useCallback(() => {
    const endpoint = customRpcEndpoint.trim();
    if (endpoint === '') {
      return;
    }

    setSwitchingNetworkId('custom');
    setNetwork(createCustomNetwork(endpoint));
    setSwitchingNetworkId(null);
  }, [customRpcEndpoint, setNetwork]);

  const switchToCorrectEvmChain = useCallback(() => {
    if (!network?.evmChainId || !switchChain) {
      return;
    }

    switchChain({ chainId: network.evmChainId });
  }, [network?.evmChainId, switchChain]);

  return (
    <div className="flex items-center gap-2">
      {isWrongEvmNetwork && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          title="Switch to required network"
          aria-label="Switch to required network"
          onClick={switchToCorrectEvmChain}
          className="h-11 w-11 border-border bg-muted/30 p-0 hover:bg-muted"
        >
          <Alert className="fill-[var(--surface-warning-text)]" />
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            className="h-11 gap-2 border-border bg-muted/30 px-3 font-bold text-foreground hover:bg-muted"
          >
            {isLoading ? (
              <Spinner size="lg" />
            ) : (
              <ChainIcon size="lg" className="shrink-0" name={networkName} />
            )}
            <span className="hidden sm:inline">{networkName}</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel>Network</DropdownMenuLabel>
          {networks.map((item) => {
            const isSelected = network?.id === item.id;
            const isSwitching = switchingNetworkId === item.id;

            return (
              <DropdownMenuItem
                key={item.id}
                disabled={isSelected}
                onSelect={() => handleNetworkChange(item)}
                className="flex items-center justify-between gap-3"
              >
                <span className="flex min-w-0 items-center gap-2">
                  {isSwitching ? (
                    <Spinner size="md" />
                  ) : (
                    <ChainIcon size="lg" name={item.name} />
                  )}
                  <span className="truncate font-semibold">{item.name}</span>
                </span>
                {isSelected && (
                  <StatusIndicator
                    variant={isWrongEvmNetwork ? 'warning' : 'success'}
                  />
                )}
              </DropdownMenuItem>
            );
          })}

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="flex items-center gap-2">
            <SettingsFillIcon size="md" />
            Custom RPC
          </DropdownMenuLabel>
          <div className="space-y-2 px-2 pb-2">
            <input
              id="custom-rpc-endpoint"
              value={customRpcEndpoint}
              onChange={(event) => setCustomRpcEndpoint(event.target.value)}
              placeholder="RPC endpoint URL"
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-foreground text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              disabled={customRpcEndpoint.trim() === ''}
              onClick={handleCustomNetwork}
            >
              Use custom endpoint
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
