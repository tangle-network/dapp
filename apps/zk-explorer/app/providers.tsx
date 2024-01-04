import NextThemeProvider from '@webb-tools/api-provider-environment/NextThemeProvider';
import type { PropsWithChildren } from 'react';
import { SidebarProvider } from '../components/SidebarProvider';
import { AuthProvider } from '../hooks/useAuth';

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <NextThemeProvider defaultTheme="dark">
      <AuthProvider>
        <SidebarProvider>{children}</SidebarProvider>
      </AuthProvider>
    </NextThemeProvider>
  );
};

export default Providers;
