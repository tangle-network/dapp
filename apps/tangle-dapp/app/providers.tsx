'use client';

import {
  AppEvent,
  NextThemeProvider,
  WebbProvider,
} from '@webb-tools/api-provider-environment';
import { WebbUIProvider } from '@webb-tools/webb-ui-components';
import NextAdapterApp from 'next-query-params/app';
import qs from 'query-string';
import { type PropsWithChildren, type ReactNode } from 'react';
import { QueryParamProvider } from 'use-query-params';

const appEvent = new AppEvent();

const Providers = ({ children }: PropsWithChildren): ReactNode => {
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
            {children}
          </QueryParamProvider>
        </WebbProvider>
      </WebbUIProvider>
    </NextThemeProvider>
  );
};

export default Providers;
