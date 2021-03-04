import './initI18n';

import { EventsWatcher } from '@webb-dapp/react-components';
import { DAppError } from '@webb-dapp/react-components/utils/Error/DAppError';
import { RouterProvider, WebbProvider } from '@webb-dapp/react-environment';
import { UIProvider } from '@webb-dapp/ui-components';
import Theme from '@webb-dapp/ui-components/styles/Theme';
import { LoggerService } from '@webb-tools/app-util';
import React, { FC } from 'react';
import { hot } from 'react-hot-loader/root';

import { config as routerConfig } from './router-config';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core';

const appLogger = LoggerService.new('App');
const muiTheme = createMuiTheme({
  palette: {
    // type: 'dark',
  },
});
const App: FC = () => {
  return (
    <DAppError logger={appLogger}>
      <UIProvider>
        <WebbProvider applicationName={'Webb Dapp'}>
          <Theme />
          <MuiThemeProvider theme={muiTheme}>
            <RouterProvider config={routerConfig} />
          </MuiThemeProvider>
          <EventsWatcher />
        </WebbProvider>
      </UIProvider>
    </DAppError>
  );
};

export default process.env.NODE_ENV === 'development' ? hot(App) : App;
