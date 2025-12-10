import { OFACFilterProvider } from '@tangle-network/api-provider-environment';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@tangle-network/dapp-config/wagmi-config';
import { UIProvider } from '@tangle-network/ui-components';
import { type PropsWithChildren, type ReactNode, useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { z } from 'zod';
import BridgeHyperlaneProvider from '../features/bridge/context/BridgeHyperlaneContext/BridgeHyperlaneProvider';
import BridgeTxQueueProvider from '../features/bridge/context/BridgeTxQueueContext/BridgeTxQueueProvider';

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

  const {
    OFAC_COUNTRY_CODES: blockedCountryCodes,
    OFAC_REGIONS: blockedRegions,
  } = envSchema.parse(process.env);

  return (
    <UIProvider hasErrorBoundary>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            theme={darkTheme({
              accentColor: '#7c3aed',
              accentColorForeground: 'white',
              borderRadius: 'medium',
            })}
            modalSize="compact"
          >
            <OFACFilterProvider
              isActivated={process.env.NODE_ENV !== 'development'}
              blockedRegions={blockedRegions}
              blockedCountryCodes={blockedCountryCodes}
            >
              <BridgeHyperlaneProvider>
                <BridgeTxQueueProvider>{children}</BridgeTxQueueProvider>
              </BridgeHyperlaneProvider>
            </OFACFilterProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </UIProvider>
  );
};

export default Providers;
