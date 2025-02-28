'use client';

import {
  AppEvent,
  WebbProvider,
} from '@tangle-network/api-provider-environment';
import { UIProvider } from '@tangle-network/ui-components';
import { type PropsWithChildren, type ReactNode } from 'react';
import type { State } from 'wagmi';
import PolkadotApiProvider from '@tangle-network/tangle-shared-ui/context/PolkadotApiProvider';

const appEvent = new AppEvent();

type Props = {
  wagmiInitialState?: State;
};

const Providers = ({
  children,
  wagmiInitialState,
}: PropsWithChildren<Props>): ReactNode => {
  return (
    <UIProvider hasErrorBoundary>
      <WebbProvider
        appEvent={appEvent}
        applicationName="Tangle Cloud"
        wagmiInitialState={wagmiInitialState}
      >
        <PolkadotApiProvider>
          {children}
        </PolkadotApiProvider>
      </WebbProvider>
    </UIProvider>
  );
};

export default Providers;
