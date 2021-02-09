import './initI18n';

import { EventsWatcher } from '@webb-dapp/react-components';
import { RouterProvider, WebbProvider } from '@webb-dapp/react-environment';
import { UIProvider } from '@webb-dapp/ui-components';
import React, { FC } from 'react';
import { hot } from 'react-hot-loader/root';

import { config as routerConfig } from './router-config';

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
