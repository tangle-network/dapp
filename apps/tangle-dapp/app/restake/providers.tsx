'use client';

import { PolkadotApiProvider } from '@webb-tools/tangle-shared-ui/context/PolkadotApiContext';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { type PropsWithChildren } from 'react';

import { RestakeContextProvider } from '../../context/RestakeContext';

export default function Providers({ children }: PropsWithChildren) {
  return (
    <PolkadotApiProvider>
      <RestakeContextProvider>
        <NuqsAdapter>{children}</NuqsAdapter>
      </RestakeContextProvider>
    </PolkadotApiProvider>
  );
}
