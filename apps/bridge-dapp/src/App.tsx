import { WebbUIErrorBoudary } from '@webb-tools/webb-ui-components/containers/WebbUIErrorBoudary';
import { RouterProvider } from '@webb-tools/react-environment';
import { WebbProvider, AppEvent } from '@webb-tools/api-provider-environment';
import { LoggerService } from '@webb-tools/app-util';
import React, { FC } from 'react';

import { config as routerConfig } from './routes';
const appLogger = LoggerService.new('App');

const appEvent = new AppEvent();

const App: FC = () => {
  return (
    <WebbUIErrorBoudary logger={appLogger}>
      <WebbProvider appEvent={appEvent} applicationName={'Webb DApp'}>
        <RouterProvider config={routerConfig} />
      </WebbProvider>
    </WebbUIErrorBoudary>
  );
};

export default App;
