import { UIProvider } from '@tangle-network/ui-components/provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';

const queryClient = new QueryClient();

const Provider = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      <UIProvider hasErrorBoundary>{children}</UIProvider>
    </QueryClientProvider>
  );
};

export default Provider;
