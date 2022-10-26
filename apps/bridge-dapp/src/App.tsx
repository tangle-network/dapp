import { StyledEngineProvider } from '@mui/styled-engine';
import { WebbUIErrorBoudary } from '@nepoche/webb-ui-components/containers/WebbUIErrorBoudary';
import { RouterProvider } from '@nepoche/react-environment';
import { WebbProvider, AppEvent } from '@nepoche/api-provider-environment';
import { LoggerService } from '@webb-tools/app-util';
import React, { FC } from 'react';

import { config as routerConfig } from './routes';
const appLogger = LoggerService.new('App');

const appEvent = new AppEvent();

const App: FC = () => {
  return (
    <WebbUIErrorBoudary logger={appLogger}>
      <WebbProvider appEvent={appEvent} applicationName={'Webb DApp'}>
        <StyledEngineProvider injectFirst>
          <RouterProvider config={routerConfig} />
        </StyledEngineProvider>
      </WebbProvider>
    </WebbUIErrorBoudary>
  );
};

export default App;
