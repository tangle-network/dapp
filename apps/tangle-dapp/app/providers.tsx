'use client';

import {
  AppEvent,
  NextThemeProvider,
  WebbProvider,
} from '@webb-tools/api-provider-environment';
import { WebbUIProvider } from '@webb-tools/webb-ui-components';
import type { PropsWithChildren } from 'react';

const appEvent = new AppEvent();

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <NextThemeProvider>
      <WebbUIProvider hasErrorBoudary>
        <WebbProvider appEvent={appEvent} applicationName="Tangle Dapp">
          {children}
        </WebbProvider>
      </WebbUIProvider>
    </NextThemeProvider>
  );
};

export default Providers;
