import React, { FC } from 'react';

import { UIProvider } from '@webb-dapp/ui-components';
import { WebbProvider, RouterProvider } from '@webb-dapp/react-environment';
import { EventsWatcher } from '@webb-dapp/react-components';

import { config as routerConfig } from './router-config';
import './initI18n';

const App: FC = () => {
  return (
    <UIProvider>
      <WebbProvider applicationName={'Acala Dapp'}>
        <RouterProvider config={routerConfig} />
        <EventsWatcher />
      </WebbProvider>
    </UIProvider>
  );
};

export default App;
