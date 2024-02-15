'use client';

import {
  AppEvent,
  NextThemeProvider,
  OFACFilterProvider,
  WebbProvider,
} from '@webb-tools/api-provider-environment';
import { WebbUIProvider } from '@webb-tools/webb-ui-components';
import { type PropsWithChildren, type ReactNode } from 'react';
import z from 'zod';

import { TxConfirmationProvider } from '../context/TxConfirmationContext';

const appEvent = new AppEvent();

const envSchema = z.object({
  OFAC_REGIONS: z
    .preprocess((val) => JSON.parse(String(val)), z.array(z.string()))
    .optional(),
  OFAC_COUNTRY_CODES: z
    .preprocess((val) => JSON.parse(String(val)), z.array(z.string()))
    .optional(),
});

const Providers = ({ children }: PropsWithChildren): ReactNode => {
  const {
    OFAC_COUNTRY_CODES: blockedCountryCodes,
    OFAC_REGIONS: blockedRegions,
  } = envSchema.parse(process.env);

  return (
    <NextThemeProvider>
      <WebbUIProvider hasErrorBoudary isNextApp>
        <WebbProvider appEvent={appEvent} applicationName="Tangle Dapp">
          <OFACFilterProvider
            isActivated
            blockedRegions={blockedRegions}
            blockedCountryCodes={blockedCountryCodes}
          >
            <TxConfirmationProvider>{children}</TxConfirmationProvider>
          </OFACFilterProvider>
        </WebbProvider>
      </WebbUIProvider>
    </NextThemeProvider>
  );
};

export default Providers;
