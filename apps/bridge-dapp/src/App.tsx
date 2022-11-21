import { AppEvent, WebbProvider } from '@webb-tools/api-provider-environment';
import { RouterProvider } from '@webb-tools/react-environment';
import { FC } from 'react';

import { WebbUIProvider } from '@webb-tools/webb-ui-components';
import { config as routerConfig } from './routes';

// Singleton app event instance
export const appEvent = new AppEvent();

const App: FC = () => {
  return (
    <WebbUIProvider hasErrorBoudary>
      <WebbProvider appEvent={appEvent} applicationName={'Webb DApp'}>
        <RouterProvider config={routerConfig} />
      </WebbProvider>
    </WebbUIProvider>
  );
};

export default App;
