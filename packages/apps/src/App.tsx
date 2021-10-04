import './initI18n';

import { DAppError } from '@webb-dapp/react-components/utils/Error/DAppError';
import { RouterProvider, WebbProvider } from '@webb-dapp/react-environment';
import { UIProvider } from '@webb-dapp/ui-components';
import { NotificationStacked } from '@webb-dapp/ui-components/notification';
import Theme from '@webb-dapp/ui-components/styles/Theme';
import { LoggerService } from '@webb-tools/app-util';
import React, { FC } from 'react';
import { hot } from 'react-hot-loader/root';

import { config as routerConfig } from './router-config';
import { createAnchor2Deposit, createTornDeposit } from '@webb-dapp/contracts/utils/make-deposit';

const appLogger = LoggerService.new('App');
console.log({
  anchor2: createAnchor2Deposit(0),
  anchor1: createTornDeposit(),
});
const App: FC = () => {
  return (
    <DAppError logger={appLogger}>
      <WebbProvider applicationName={'Webb DApp'}>
        <UIProvider>
          <Theme />

          <RouterProvider config={routerConfig} />
          <NotificationStacked />
        </UIProvider>
      </WebbProvider>
    </DAppError>
  );
};

export default process.env.NODE_ENV === 'development' ? hot(App) : App;
