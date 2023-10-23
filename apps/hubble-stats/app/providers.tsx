'use client';

import NextThemeProvider from '@webb-tools/api-provider-environment/NextThemeProvider';
import { PropsWithChildren } from 'react';
import { SWRConfig } from 'swr';

export default function providers({ children }: PropsWithChildren) {
  return (
    <SWRConfig value={{ refreshInterval: 5000 }}>
      <NextThemeProvider>{children}</NextThemeProvider>
    </SWRConfig>
  );
}
