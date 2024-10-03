import { PropsWithChildren } from 'react';

import { PolkadotApiProvider } from '../../context/PolkadotApiContext';
import { RestakeContextProvider } from '../../context/RestakeContext';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <PolkadotApiProvider>
      <RestakeContextProvider>{children}</RestakeContextProvider>
    </PolkadotApiProvider>
  );
}
