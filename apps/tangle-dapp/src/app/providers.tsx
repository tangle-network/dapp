import {
  AppEvent,
  OFACFilterProvider,
  WebbProvider,
} from '@webb-tools/api-provider-environment';
import { WebbUIProvider } from '@webb-tools/webb-ui-components';
import { type PropsWithChildren, type ReactNode } from 'react';
import type { State } from 'wagmi';
import { z } from 'zod';

import HyperlaneWarpContext from '../pages/bridge/context/HyperlaneWarpContext';
import BridgeTxQueueProvider from '../pages/bridge/context/BridgeTxQueueContext/BridgeTxQueueProvider';
import PolkadotApiProvider from '@webb-tools/tangle-shared-ui/context/PolkadotApiProvider';
import { RestakeContextProvider } from '@webb-tools/tangle-shared-ui/context/RestakeContext';

const appEvent = new AppEvent();

const envSchema = z.object({
  OFAC_REGIONS: z
    .preprocess((val) => JSON.parse(String(val)), z.array(z.string()))
    .optional(),
  OFAC_COUNTRY_CODES: z
    .preprocess((val) => JSON.parse(String(val)), z.array(z.string()))
    .optional(),
});

type Props = {
  wagmiInitialState?: State;
};

const Providers = ({
  children,
  wagmiInitialState,
}: PropsWithChildren<Props>): ReactNode => {
  const {
    OFAC_COUNTRY_CODES: blockedCountryCodes,
    OFAC_REGIONS: blockedRegions,
  } = envSchema.parse(process.env);

  return (
    <WebbUIProvider hasErrorBoundary>
      <WebbProvider
        appEvent={appEvent}
        applicationName="Tangle dApp"
        isSSR
        wagmiInitialState={wagmiInitialState}
      >
        <OFACFilterProvider
          isActivated={process.env.NODE_ENV !== 'development'}
          blockedRegions={blockedRegions}
          blockedCountryCodes={blockedCountryCodes}
        >
          <HyperlaneWarpContext>
            <BridgeTxQueueProvider>
              <PolkadotApiProvider>
                <RestakeContextProvider>{children}</RestakeContextProvider>
              </PolkadotApiProvider>
            </BridgeTxQueueProvider>
          </HyperlaneWarpContext>
        </OFACFilterProvider>
      </WebbProvider>
    </WebbUIProvider>
  );
};

export default Providers;
