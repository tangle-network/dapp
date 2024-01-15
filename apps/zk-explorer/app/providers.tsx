import NextThemeProvider from '@webb-tools/api-provider-environment/NextThemeProvider';
import { NotificationProvider } from '@webb-tools/webb-ui-components';
import type { PropsWithChildren } from 'react';
import { SidebarProvider } from '../components/SidebarProvider';
import { AuthProvider } from '../hooks/useAuth';

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <NextThemeProvider defaultTheme="dark">
      <NotificationProvider>
        <AuthProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </AuthProvider>
      </NotificationProvider>
    </NextThemeProvider>
  );
};

export default Providers;
