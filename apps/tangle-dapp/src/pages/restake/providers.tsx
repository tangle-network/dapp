import { RestakeContextProvider } from '@webb-tools/tangle-shared-ui/context/RestakeContext';
import { type PropsWithChildren } from 'react';

export default function Providers({ children }: PropsWithChildren) {
  return <RestakeContextProvider>{children}</RestakeContextProvider>;
}
