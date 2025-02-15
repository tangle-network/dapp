'use client';

import {
  AppEvent,
  NextThemeProvider,
  WebbProvider,
} from '@tangle-network/api-provider-environment';
import { UIProvider } from '@tangle-network/ui-components';
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
      <UIProvider hasErrorBoundary isNextApp>
        <WebbProvider
          appEvent={appEvent}
          applicationName="Tangle dApp"
          isSSR
          wagmiInitialState={wagmiInitialState}
        >
          {children}
        </WebbProvider>
      </UIProvider>
    </NextThemeProvider>
  );
};

export default Providers;
