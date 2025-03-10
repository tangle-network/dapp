import { WebbUIProvider } from '@tangle-network/ui-components/provider';
import type { PropsWithChildren } from 'react';

const Provider = ({ children }: PropsWithChildren) => {
  return (
    <WebbUIProvider hasErrorBoudary defaultThemeMode="light">
      {children}
    </WebbUIProvider>
  );
};

export default Provider;
