'use client';

import { AppEvent, WebbProvider } from '@webb-tools/api-provider-environment';
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
    <WebbUIProvider hasErrorBoundary>
      <WebbProvider
        appEvent={appEvent}
        applicationName="Tangle Cloud"
        wagmiInitialState={wagmiInitialState}
      >
        {children}
      </WebbProvider>
    </WebbUIProvider>
  );
};

export default Providers;
