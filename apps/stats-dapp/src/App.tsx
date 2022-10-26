import { RouterProvider } from '@nepoche/react-environment';
import { WebbUIProvider } from '@nepoche/webb-ui-components';
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
