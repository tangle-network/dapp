import './initI18n';

import { StyledEngineProvider } from '@mui/styled-engine';
import { DAppError } from '@webb-dapp/react-components/utils/Error/DAppError';
import { IpProvider, RouterProvider, WebbProvider } from '@webb-dapp/react-environment';
import { UIProvider } from '@webb-dapp/ui-components';
import { NotificationStacked } from '@webb-dapp/ui-components/notification';
import Theme from '@webb-dapp/ui-components/styles/Theme';
import { WebbUIProvider } from '@webb-dapp/webb-ui-components/provider';
import { LoggerService } from '@webb-tools/app-util';
import React, { FC } from 'react';

import { config as routerConfig } from './router-config';
const appLogger = LoggerService.new('App');
appLogger.log('process.env: ', process.env);

const App: FC = () => {
  return (
    // @ts-ignore
    <DAppError logger={appLogger}>
      <WebbUIProvider>
        <WebbProvider applicationName={'Webb DApp'}>
          <StyledEngineProvider injectFirst>
            <UIProvider>
              <IpProvider>
                <Theme />
                <RouterProvider config={routerConfig} />
                <NotificationStacked />
              </IpProvider>
            </UIProvider>
          </StyledEngineProvider>
        </WebbProvider>
      </WebbUIProvider>
    </DAppError>
  );
};

export default App;
