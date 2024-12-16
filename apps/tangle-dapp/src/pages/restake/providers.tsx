import PolkadotApiProvider from '@webb-tools/tangle-shared-ui/context/PolkadotApiProvider';
import { type PropsWithChildren } from 'react';

import { RestakeContextProvider } from '../../context/RestakeContext';

export default function Providers({ children }: PropsWithChildren) {
  return (
    <PolkadotApiProvider>
      <RestakeContextProvider>{children}</RestakeContextProvider>
    </PolkadotApiProvider>
  );
}
