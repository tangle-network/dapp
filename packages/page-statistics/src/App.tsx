import { RouterProvider } from '@webb-dapp/react-environment/RouterProvider';
import { WebbUIProvider } from '@webb-dapp/webb-ui-components/provider';
import { FC } from 'react';

import { routes } from './routes';

const App: FC = () => {
  return (
    <WebbUIProvider hasErrorBoudary>
      <RouterProvider config={routes} />
    </WebbUIProvider>
  );
};

export default App;
