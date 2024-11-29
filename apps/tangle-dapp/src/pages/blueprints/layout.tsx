import { PolkadotApiProvider } from '@webb-tools/tangle-shared-ui/context/PolkadotApiContext';
import { PropsWithChildren } from 'react';

import { RestakeContextProvider } from '../../context/RestakeContext';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <PolkadotApiProvider>
      <RestakeContextProvider>{children}</RestakeContextProvider>
    </PolkadotApiProvider>
  );
}
