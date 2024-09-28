import { PropsWithChildren } from 'react';

import { PolkadotApiProvider } from '../../context/PolkadotApiContext';

export default function Layout({ children }: PropsWithChildren) {
  return <PolkadotApiProvider>{children}</PolkadotApiProvider>;
}
