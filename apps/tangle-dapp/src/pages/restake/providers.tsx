'use client';

import { type PropsWithChildren } from 'react';

import { RestakeContextProvider } from '../../context/RestakeContext';

export default function Providers({ children }: PropsWithChildren) {
  return <RestakeContextProvider>{children}</RestakeContextProvider>;
}
