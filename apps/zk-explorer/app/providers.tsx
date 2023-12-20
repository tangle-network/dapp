import { WebbUIProvider } from '@webb-tools/webb-ui-components/provider';
import type { PropsWithChildren } from 'react';

const Providers = ({ children }: PropsWithChildren) => {
  return <WebbUIProvider hasErrorBoudary>{children}</WebbUIProvider>;
};

export default Providers;
