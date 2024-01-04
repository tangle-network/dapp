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

const appEvent = new AppEvent();

const Providers = ({ children }: PropsWithChildren): ReactNode => {
  const blockedRegions =
    typeof process.env['OFAC_REGIONS'] === 'string' &&
    process.env['OFAC_REGIONS'].length > 0
      ? JSON.parse(process.env['OFAC_REGIONS'])
      : undefined;

  const blockedCountryCodes =
    typeof process.env['OFAC_COUNTRY_CODES'] === 'string' &&
    process.env['OFAC_COUNTRY_CODES'].length > 0
      ? JSON.parse(process.env['OFAC_COUNTRY_CODES'])
      : undefined;

  return (
    <NextThemeProvider>
      <WebbUIProvider hasErrorBoudary>
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
