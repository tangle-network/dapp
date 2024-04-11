import * as Sentry from '@sentry/react';
import { AppEvent, WebbProvider } from '@webb-tools/api-provider-environment';
import { WebbUIProvider } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import AppRoutes from './routes';

// Singleton app event instance
export const appEvent = new AppEvent();

const App: FC = () => {
  return (
    <WebbUIProvider hasErrorBoudary>
      <WebbProvider appEvent={appEvent} applicationName={'Hubble Bridge dApp'}>
        <AppRoutes />
      </WebbProvider>
    </WebbUIProvider>
  );
};

export default Sentry.withProfiler(App);
