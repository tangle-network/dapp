import type { PropsWithChildren } from 'react';
import NextThemeProvider from '@webb-tools/api-provider-environment/NextThemeProvider';
import { SidebarProvider } from '../components/SidebarProvider';

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <NextThemeProvider defaultTheme="dark">
      <SidebarProvider>{children}</SidebarProvider>
    </NextThemeProvider>
  );
};

export default Providers;
