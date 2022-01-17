import './initI18n';

import { DAppError } from '@webb-dapp/react-components/utils/Error/DAppError';
import { IpProvider, RouterProvider, WebbProvider } from '@webb-dapp/react-environment';
import { UIProvider } from '@webb-dapp/ui-components';
import { NotificationStacked } from '@webb-dapp/ui-components/notification';
import Theme from '@webb-dapp/ui-components/styles/Theme';
import { LoggerService } from '@webb-tools/app-util';
import React, { FC } from 'react';
import { hot } from 'react-hot-loader/root';

import { config as routerConfig } from './router-config';
console.log(process.env);
const appLogger = LoggerService.new('App');
const App: FC = () => {
  return (
    <DAppError logger={appLogger}>
      <WebbProvider applicationName={'Webb DApp'}>
        <UIProvider>
          <IpProvider>
            <Theme />
            <RouterProvider config={routerConfig} />
            <NotificationStacked />
          </IpProvider>
        </UIProvider>
      </WebbProvider>
    </DAppError>
  );
};

export default process.env.NODE_ENV === 'development' ? hot(App) : App;
