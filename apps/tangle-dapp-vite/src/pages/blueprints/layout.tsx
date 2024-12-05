import { PolkadotApiProvider } from '@webb-tools/tangle-shared-ui/context/PolkadotApiContext';

import { Outlet } from 'react-router';
import { RestakeContextProvider } from '../../context/RestakeContext';

export default function Layout() {
  return (
    <PolkadotApiProvider>
      <RestakeContextProvider>
        <Outlet />
      </RestakeContextProvider>
    </PolkadotApiProvider>
  );
}
