import { getBrowserLocalServiceUrl } from '@tangle-network/tangle-shared-ui/utils/localPreview';
import anvilLocal from '@tangle-network/dapp-config/chains/evm/customChains/anvilLocal';
import { baseSepolia } from 'viem/chains';
import { createConfig, http, injected } from 'wagmi';

const chains = [anvilLocal, baseSepolia] as const;

export const cloudWagmiConfig = createConfig({
  chains,
  multiInjectedProviderDiscovery: true,
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    [anvilLocal.id]: http(getBrowserLocalServiceUrl(8545), {
      timeout: 4_000,
    }),
    [baseSepolia.id]: http('https://sepolia.base.org', { timeout: 8_000 }),
  },
});
