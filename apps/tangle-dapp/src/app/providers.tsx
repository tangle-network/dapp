import { OFACFilterProvider } from '@tangle-network/api-provider-environment';
import {
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@tangle-network/dapp-config/wagmi-config';
import { DataSourceProvider } from '@tangle-network/tangle-shared-ui/context/DataSourceContext';
import { UIProvider, useUIContext } from '@tangle-network/ui-components';
import { type PropsWithChildren, type ReactNode, useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { z } from 'zod';

const envSchema = z.object({
  OFAC_REGIONS: z
    .preprocess((val) => JSON.parse(String(val)), z.array(z.string()))
    .optional(),
  OFAC_COUNTRY_CODES: z
    .preprocess((val) => JSON.parse(String(val)), z.array(z.string()))
    .optional(),
});

const rainbowThemeConfig = {
  accentColor: '#7c3aed',
  accentColorForeground: 'white',
  borderRadius: 'medium' as const,
};

const ThemedRainbowKit = ({ children }: PropsWithChildren): ReactNode => {
  const { theme } = useUIContext();
  const rainbowTheme = theme.isDarkMode
    ? darkTheme(rainbowThemeConfig)
    : lightTheme(rainbowThemeConfig);

  return (
    <RainbowKitProvider theme={rainbowTheme} modalSize="compact">
      {children}
    </RainbowKitProvider>
  );
};

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
          <ThemedRainbowKit>
            <DataSourceProvider>
              <OFACFilterProvider
                isActivated={process.env.NODE_ENV !== 'development'}
                blockedRegions={blockedRegions}
                blockedCountryCodes={blockedCountryCodes}
              >
                {children}
              </OFACFilterProvider>
            </DataSourceProvider>
          </ThemedRainbowKit>
        </QueryClientProvider>
      </WagmiProvider>
    </UIProvider>
  );
};

export default Providers;
