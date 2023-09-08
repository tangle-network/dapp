import * as Sentry from '@sentry/react';
import { AppEvent, WebbProvider } from '@webb-tools/api-provider-environment';
import { WebbUIProvider } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import BridgeRoutes from './routes';

// Singleton app event instance
export const appEvent = new AppEvent();

const App: FC = () => {
  return (
    <WebbUIProvider hasErrorBoudary>
      <WebbProvider appEvent={appEvent} applicationName={'Webb DApp'}>
        <BridgeRoutes />
      </WebbProvider>
    </WebbUIProvider>
  );
};

export default Sentry.withProfiler(App);
