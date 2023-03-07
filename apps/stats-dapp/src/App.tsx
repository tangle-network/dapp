import { RouterProvider } from '@webb-tools/react-environment';
import { WebbUIProvider } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import * as Sentry from '@sentry/react';

import { routes } from './routes';

const App: FC = () => {
  return (
    <WebbUIProvider hasErrorBoudary>
      <RouterProvider config={routes} />
    </WebbUIProvider>
  );
};

export default Sentry.withProfiler(App);
