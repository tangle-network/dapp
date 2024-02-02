'use client';

import {
  AppEvent,
  NextThemeProvider,
  OFACFilterProvider,
  WebbProvider,
} from '@webb-tools/api-provider-environment';
import { WebbUIProvider } from '@webb-tools/webb-ui-components';
import NextAdapterApp from 'next-query-params/app';
import qs from 'query-string';
import { type PropsWithChildren, type ReactNode } from 'react';
import { QueryParamProvider } from 'use-query-params';
import z from 'zod';

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
          <QueryParamProvider
            adapter={NextAdapterApp}
            options={{
              searchStringToObject: qs.parse,
              objectToSearchString: qs.stringify,
            }}
          >
            <OFACFilterProvider
              isActivated
              blockedRegions={blockedRegions}
              blockedCountryCodes={blockedCountryCodes}
            >
              {children}
            </OFACFilterProvider>
          </QueryParamProvider>
        </WebbProvider>
      </WebbUIProvider>
    </NextThemeProvider>
  );
};

export default Providers;
