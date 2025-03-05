import {
  AppEvent,
  OFACFilterProvider,
  WebbProvider,
} from '@tangle-network/api-provider-environment';
import { UIProvider } from '@tangle-network/ui-components';
import { type PropsWithChildren, type ReactNode } from 'react';
import type { State } from 'wagmi';
import { z } from 'zod';
import HyperlaneWarpContext from '../features/bridge/context/HyperlaneWarpContext';
import BridgeTxQueueProvider from '../features/bridge/context/BridgeTxQueueContext/BridgeTxQueueProvider';
import PolkadotApiProvider from '@tangle-network/tangle-shared-ui/context/PolkadotApiProvider';

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
    <UIProvider hasErrorBoundary>
      <WebbProvider
        appEvent={appEvent}
        applicationName="Tangle dApp"
        wagmiInitialState={wagmiInitialState}
      >
        <OFACFilterProvider
          isActivated={process.env.NODE_ENV !== 'development'}
          blockedRegions={blockedRegions}
          blockedCountryCodes={blockedCountryCodes}
        >
          <HyperlaneWarpContext>
            <BridgeTxQueueProvider>
              <PolkadotApiProvider>{children}</PolkadotApiProvider>
            </BridgeTxQueueProvider>
          </HyperlaneWarpContext>
        </OFACFilterProvider>
      </WebbProvider>
    </UIProvider>
  );
};

export default Providers;
