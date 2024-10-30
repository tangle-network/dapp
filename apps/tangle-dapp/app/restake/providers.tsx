'use client';

import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { type PropsWithChildren } from 'react';

import { PolkadotApiProvider } from '../../context/PolkadotApiContext';
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
