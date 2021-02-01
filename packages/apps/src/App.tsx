import React, { FC } from 'react';
import { hot } from 'react-hot-loader/root';
import { UIProvider } from '@webb-dapp/ui-components';
import { WebbProvider, RouterProvider } from '@webb-dapp/react-environment';
import { EventsWatcher } from '@webb-dapp/react-components';

import { config as routerConfig } from './router-config';
import './initI18n';

const App: FC = () => {
  return (
    <UIProvider>
      <WebbProvider applicationName={'Webb Dapp'}>
        <RouterProvider config={routerConfig} />
        <EventsWatcher />
      </WebbProvider>
    </UIProvider>
  );
};

export default process.env.NODE_ENV === 'development' ? hot(App) : App;
