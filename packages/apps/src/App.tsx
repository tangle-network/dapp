import './initI18n';
import { EventsWatcher } from '@webb-dapp/react-components';
import { DAppError } from '@webb-dapp/react-components/utils/Error/DAppError';
import { RouterProvider, WebbProvider } from '@webb-dapp/react-environment';
import { UIProvider } from '@webb-dapp/ui-components';
import Theme from '@webb-dapp/ui-components/styles/Theme';
import makeTheme from '@webb-dapp/ui-components/styling/themes/makeTheme';
import { LoggerService } from '@webb-tools/app-util';
import React, { FC } from 'react';
import { hot } from 'react-hot-loader/root';

import { config as routerConfig } from './router-config';

const appLogger = LoggerService.new('App');
const muiTheme = makeTheme({}, 'light');
const App: FC = () => {
  return (
    <DAppError logger={appLogger}>
      <WebbProvider applicationName={'Webb DApp'}>
        <UIProvider>
          <Theme />
          <RouterProvider config={routerConfig} />
          <EventsWatcher />
        </UIProvider>
      </WebbProvider>
    </DAppError>
  );
};

export default process.env.NODE_ENV === 'development' ? hot(App) : App;
