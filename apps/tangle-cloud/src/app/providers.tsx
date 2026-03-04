'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@tangle-network/dapp-config/wagmi-config';
import { UIProvider } from '@tangle-network/ui-components';
import {
  ANVIL_LOCAL_NETWORK,
  BASE_SEPOLIA_NETWORK,
} from '@tangle-network/ui-components/constants/networks';
import useLocalChainGuard from '@tangle-network/tangle-shared-ui/hooks/useLocalChainGuard';
import useNetworkSync from '@tangle-network/tangle-shared-ui/hooks/useNetworkSync';
import { IndexerStatusProvider } from '@tangle-network/tangle-shared-ui/context/IndexerStatusContext';
import { FC, type PropsWithChildren, useState } from 'react';
import { WagmiProvider } from 'wagmi';

// EVM networks available in tangle-cloud
const TANGLE_CLOUD_NETWORKS = [ANVIL_LOCAL_NETWORK, BASE_SEPOLIA_NETWORK];

// Component to sync network store with wagmi chain
const NetworkSync: FC<PropsWithChildren> = ({ children }) => {
  useNetworkSync(TANGLE_CLOUD_NETWORKS);
  useLocalChainGuard({
    enabled:
      import.meta.env.DEV && import.meta.env.VITE_FORCE_LOCAL_CHAIN === 'true',
    targetChainId: ANVIL_LOCAL_NETWORK.evmChainId ?? 31337,
  });
  return children;
};

const Providers: FC<PropsWithChildren> = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient());
  const reconnectOnMount = (() => {
    const override = import.meta.env.VITE_WALLET_RECONNECT_ON_MOUNT;
    if (override === 'true') return true;
    if (override === 'false') return false;
    return true;
  })();

  return (
    <UIProvider hasErrorBoundary>
      <WagmiProvider config={config} reconnectOnMount={reconnectOnMount}>
        <QueryClientProvider client={queryClient}>
          <IndexerStatusProvider>
            <NetworkSync>{children}</NetworkSync>
          </IndexerStatusProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </UIProvider>
  );
};

export default Providers;
