'use client';

import {
  AppEvent,
  WebbProvider,
} from '@tangle-network/api-provider-environment';
import { UIProvider } from '@tangle-network/ui-components';
import { FC, type PropsWithChildren } from 'react';
import type { State } from 'wagmi';

const appEvent = new AppEvent();

type Props = {
  wagmiInitialState?: State;
};

const Providers: FC<PropsWithChildren<Props>> = ({
  children,
  wagmiInitialState,
}) => {
  return (
    <UIProvider hasErrorBoundary>
      <WebbProvider
        appEvent={appEvent}
        applicationName="Tangle Cloud"
        wagmiInitialState={wagmiInitialState}
      >
        {children}
      </WebbProvider>
    </UIProvider>
  );
};

export default Providers;
