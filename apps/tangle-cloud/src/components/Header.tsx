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
import { Link, useLocation } from 'react-router';
import { twMerge } from 'tailwind-merge';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import TxHistoryDrawer from './TxHistoryDrawer';
import { useTopNavSlotContent } from './chrome/TopNavSlot';
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
  const trail = useMemo(() => getHeaderTrail(pathname), [pathname]);
  const topNavContent = useTopNavSlotContent();
  const hasContextualConnect =
    pathname.startsWith('/rewards') ||
    pathname.startsWith('/earnings') ||
    pathname.startsWith('/instances');

  return (
    <header
      className={twMerge(
        'tangle-cloud-topbar fixed top-0 right-0 left-0 z-40 flex h-14 items-center justify-between gap-4 border-b border-border bg-[var(--bg-elevated)] px-4 font-sans text-[13px] tracking-tight lg:left-16 lg:px-8',
        className,
      )}
      {...props}
    >
      {/* Topbar left slot: the route breadcrumb trail by default
       * ("Blueprints / Trading"); pages can override it with contextual
       * content (name + actions) via useTopNavSlot. */}
      <div className="ml-12 flex min-w-0 flex-1 items-center gap-2 sm:ml-0">
        {topNavContent ?? <HeaderTrail items={trail} />}
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2">
        <TxHistoryDrawer />

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

type TrailItem = { label: string; href?: string };

/**
 * Breadcrumb trail for the top nav ("Blueprints / Trading"). The leading
 * "Cloud" is dropped — the whole app is Cloud and the sidebar already names
 * the section. Non-leaf section roots link back (e.g. Blueprints → catalog).
 * Blueprint *detail* pages override this via useTopNavSlot with the real name.
 */
const getHeaderTrail = (pathname: string): TrailItem[] => {
  const blueprints: TrailItem = { label: 'Blueprints', href: '/blueprints' };
  const operators: TrailItem = { label: 'Operators', href: '/operators' };
  const instances: TrailItem = { label: 'Instances', href: '/instances' };

  if (pathname === '/blueprints/create')
    return [blueprints, { label: 'Create' }];
  if (pathname === '/blueprints/manage')
    return [blueprints, { label: 'Manage' }];
  if (pathname.startsWith('/blueprints/') && pathname.endsWith('/deploy'))
    return [blueprints, { label: 'Instance checkout' }];
  if (pathname.startsWith('/blueprints/') && pathname.includes('/services/'))
    return [blueprints, { label: 'Service' }];
  if (pathname.startsWith('/blueprints/') && pathname !== '/blueprints')
    return [blueprints, { label: 'Details' }];
  if (pathname.startsWith('/blueprints')) return [blueprints];

  if (pathname === '/operators/manage') return [operators, { label: 'Manage' }];
  if (pathname.startsWith('/operators')) return [operators];
  if (pathname === '/payments/credits')
    return [{ label: 'Payments' }, { label: 'Credits' }];
  if (pathname === '/payments/pool')
    return [{ label: 'Payments' }, { label: 'Shielded pool' }];
  if (pathname.startsWith('/rewards')) return [{ label: 'Rewards' }];
  if (pathname.startsWith('/earnings')) return [{ label: 'Earnings' }];
  if (pathname.startsWith('/services/'))
    return [instances, { label: 'Service' }];
  if (pathname.startsWith('/instances')) return [instances];

  return [{ label: 'Tangle Cloud' }];
};

/** Renders a breadcrumb trail; non-leaf items with an href are links. */
function HeaderTrail({ items }: { items: TrailItem[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex min-w-0 items-center gap-1.5 text-[13px]"
    >
      {items.map((item, i) => {
        const isLeaf = i === items.length - 1;
        return (
          <span key={i} className="flex min-w-0 items-center gap-1.5">
            {i > 0 && (
              <span aria-hidden className="text-muted-foreground/40">
                /
              </span>
            )}
            {item.href && !isLeaf ? (
              <Link
                to={item.href}
                className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={twMerge(
                  isLeaf
                    ? 'truncate font-semibold text-foreground'
                    : 'shrink-0 text-muted-foreground',
                )}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

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
