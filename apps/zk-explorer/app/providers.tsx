import type { PropsWithChildren } from 'react';
import NextThemeProvider from '@webb-tools/api-provider-environment/NextThemeProvider';

const Providers = ({ children }: PropsWithChildren) => {
  return <NextThemeProvider defaultTheme='dark'>{children}</NextThemeProvider>;
};

export default Providers;
