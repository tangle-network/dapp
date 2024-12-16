import { PolkadotApiProvider } from '@webb-tools/tangle-shared-ui/context/PolkadotApiContext';
import { RestakeContextProvider } from '@webb-tools/tangle-shared-ui/context/RestakeContext';
import { Outlet } from 'react-router';

export default function Layout() {
  return (
    <PolkadotApiProvider>
      <RestakeContextProvider>
        <Outlet />
      </RestakeContextProvider>
    </PolkadotApiProvider>
  );
}
