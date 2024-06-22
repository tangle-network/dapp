'use client';

import { type PropsWithChildren } from 'react';

import { PolkadotApiProvider } from '../../context/PolkadotApiContext';
import { RestakeContextProvider } from '../../context/RestakeContext';

export default function Providers({ children }: PropsWithChildren) {
  return (
    <PolkadotApiProvider>
      <RestakeContextProvider>{children}</RestakeContextProvider>
    </PolkadotApiProvider>
  );
}
