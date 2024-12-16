'use client';

import { PolkadotApiProvider } from '@webb-tools/tangle-shared-ui/context/PolkadotApiContext';
import { RestakeContextProvider } from '@webb-tools/tangle-shared-ui/context/RestakeContext';
import { type PropsWithChildren } from 'react';

export default function Providers({ children }: PropsWithChildren) {
  return (
    <PolkadotApiProvider>
      <RestakeContextProvider>{children}</RestakeContextProvider>
    </PolkadotApiProvider>
  );
}
