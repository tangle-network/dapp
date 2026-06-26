import ConnectWalletButton from '@tangle-network/tangle-shared-ui/components/ConnectWalletButton';
import ConnectionStatusButton from '@tangle-network/tangle-shared-ui/components/ConnectionStatusButton';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import createCustomNetwork from '@tangle-network/tangle-shared-ui/utils/createCustomNetwork';
import {
  Alert,
  ChainIcon,
  SettingsFillIcon,
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
  ...props
}: ComponentProps<'header'>) {
  return (
    <header
      className={twMerge(
        'flex items-center justify-end gap-2 font-sans text-sm tracking-tight',
        className,
      )}
      {...props}
    >
      <div className="flex shrink-0 items-center justify-end gap-2">
        <TxHistoryDrawer />

        <ConnectionStatusButton />

        <CloudNetworkSelector networks={TANGLE_CLOUD_NETWORKS} />

        {/* Connection state lives in the chrome on every route — the header is
         * the single owner of Connect Wallet. Pages never duplicate this; a
         * disconnected page body renders a designed empty state instead. */}
        <ConnectWalletButton />
      </div>
    </header>
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
  const evmChainId = network?.evmChainId;

  const isWrongEvmNetwork = useMemo(() => {
    if (!isConnected || !evmChainId) {
      return false;
    }

    return evmChainId !== chainId;
  }, [chainId, evmChainId, isConnected]);

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
    if (!evmChainId || !switchChain) {
      return;
    }

    switchChain({ chainId: evmChainId });
  }, [evmChainId, switchChain]);

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
          className="h-11 w-11 border-mono-60 dark:border-mono-170 bg-mono-20/50 dark:bg-mono-190/50 p-0 hover:bg-mono-20 dark:hover:bg-mono-190"
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
            className="h-11 gap-2 border-mono-60 dark:border-mono-170 bg-mono-20/50 dark:bg-mono-190/50 px-3 font-sans font-medium not-italic text-mono-200 dark:text-mono-0 hover:bg-mono-20 dark:hover:bg-mono-190"
          >
            {isLoading ? (
              <Spinner size="lg" />
            ) : (
              <ChainIcon size="lg" className="shrink-0" name={networkName} />
            )}
            <span className="hidden font-sans not-italic sm:inline">
              {networkName}
            </span>
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
                  <span className="truncate font-sans font-medium not-italic">
                    {item.name}
                  </span>
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
              className="h-10 w-full rounded-md border border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-190 px-3 text-mono-200 dark:text-mono-0 text-sm outline-none transition-colors placeholder:text-mono-100 dark:text-mono-80 focus:border-purple-40"
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
