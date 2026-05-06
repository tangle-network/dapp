import { OFACFilterProvider } from '@tangle-network/api-provider-environment';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@tangle-network/dapp-config/wagmi-config';
import { DataSourceProvider } from '@tangle-network/tangle-shared-ui/context/DataSourceContext';
import { IndexerStatusProvider } from '@tangle-network/tangle-shared-ui/context/IndexerStatusContext';
import useLocalChainGuard from '@tangle-network/tangle-shared-ui/hooks/useLocalChainGuard';
import useNetworkSync from '@tangle-network/tangle-shared-ui/hooks/useNetworkSync';
import { UIProvider } from '@tangle-network/ui-components';
import {
  ANVIL_LOCAL_NETWORK,
  BASE_SEPOLIA_NETWORK,
  BASE_NETWORK,
} from '@tangle-network/ui-components/constants/networks';
import {
  type FC,
  type PropsWithChildren,
  type ReactNode,
  useState,
} from 'react';
import { WagmiProvider } from 'wagmi';
import { z } from 'zod';

// EVM networks available in tangle-dapp
const TANGLE_DAPP_NETWORKS = [
  ANVIL_LOCAL_NETWORK,
  BASE_SEPOLIA_NETWORK,
  BASE_NETWORK,
];

// Component to sync network store with wagmi chain
const NetworkSync: FC<PropsWithChildren> = ({ children }) => {
  useNetworkSync(TANGLE_DAPP_NETWORKS);
  useLocalChainGuard({
    enabled:
      import.meta.env.DEV && import.meta.env.VITE_FORCE_LOCAL_CHAIN === 'true',
    targetChainId: ANVIL_LOCAL_NETWORK.evmChainId ?? 31337,
  });
  return children;
};

const envSchema = z.object({
  OFAC_REGIONS: z
    .preprocess((val) => JSON.parse(String(val)), z.array(z.string()))
    .optional(),
  OFAC_COUNTRY_CODES: z
    .preprocess((val) => JSON.parse(String(val)), z.array(z.string()))
    .optional(),
});

const Providers = ({ children }: PropsWithChildren): ReactNode => {
  const [queryClient] = useState(() => new QueryClient());
  const reconnectOnMount = (() => {
    const override = import.meta.env.VITE_WALLET_RECONNECT_ON_MOUNT;
    if (override === 'true') return true;
    if (override === 'false') return false;
    return true;
  })();

  const {
    OFAC_COUNTRY_CODES: blockedCountryCodes,
    OFAC_REGIONS: blockedRegions,
  } = envSchema.parse(process.env);

  return (
    <UIProvider hasErrorBoundary>
      <WagmiProvider config={config} reconnectOnMount={reconnectOnMount}>
        <QueryClientProvider client={queryClient}>
          <IndexerStatusProvider>
            <NetworkSync>
              <DataSourceProvider>
                <OFACFilterProvider
                  isActivated={process.env.NODE_ENV !== 'development'}
                  blockedRegions={blockedRegions}
                  blockedCountryCodes={blockedCountryCodes}
                >
                  {children}
                </OFACFilterProvider>
              </DataSourceProvider>
            </NetworkSync>
          </IndexerStatusProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </UIProvider>
  );
};

export default Providers;
