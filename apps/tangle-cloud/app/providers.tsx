'use client';

import {
  AppEvent,
  NextThemeProvider,
  WebbProvider,
} from '@webb-tools/api-provider-environment';
import { WebbUIProvider } from '@webb-tools/webb-ui-components';
import { type PropsWithChildren, type ReactNode } from 'react';
import type { State } from 'wagmi';

const appEvent = new AppEvent();

type Props = {
  wagmiInitialState?: State;
};

const Providers = ({
  children,
  wagmiInitialState,
}: PropsWithChildren<Props>): ReactNode => {
  return (
    <NextThemeProvider>
      <WebbUIProvider hasErrorBoudary isNextApp>
        <WebbProvider
          appEvent={appEvent}
          applicationName="Tangle dApp"
          isSSR
          wagmiInitialState={wagmiInitialState}
        >
          {children}
        </WebbProvider>
      </WebbUIProvider>
    </NextThemeProvider>
  );
};

export default Providers;
