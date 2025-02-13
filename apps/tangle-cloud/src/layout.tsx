import '@webb-tools/webb-ui-components/tailwind.css';
import '../styles/globals.css';

import getWagmiConfig from '@webb-tools/dapp-config/wagmi-config';
import { getSidebarStateFromCookie } from '@webb-tools/webb-ui-components/next-utils';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import { cookieToInitialState } from 'wagmi';
import Layout from '../components/Layout';
import { DEFAULT_OPENGRAPH_METADATA } from '../constants/openGraph';
import Providers from './providers';

export const metadata = DEFAULT_OPENGRAPH_METADATA;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialState = cookieToInitialState(
    getWagmiConfig({ isSSR: true }),
    headers().get('cookie'),
  );

  const isSidebarInitiallyExpanded = getSidebarStateFromCookie();

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Suspense>
          <Providers wagmiInitialState={initialState}>
            <Layout isSidebarInitiallyExpanded={isSidebarInitiallyExpanded}>
              {children}
            </Layout>
          </Providers>
        </Suspense>
      </body>
    </html>
  );
}
