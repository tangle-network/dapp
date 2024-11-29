import '@webb-tools/webb-ui-components/tailwind.css';
import '../styles/globals.css';

import getWagmiConfig from '@webb-tools/dapp-config/wagmi-config';
import Suspense from '@webb-tools/webb-ui-components/components/Suspense';
import { getSidebarStateFromCookie } from '@webb-tools/webb-ui-components/next-utils';
import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import type React from 'react';
import { cookieToInitialState } from 'wagmi';

import { DEFAULT_OPENGRAPH_METADATA } from '../constants/openGraph';
import { Layout } from '../containers';
import Providers from './providers';

export const dynamic = 'force-static';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fff' },
    { media: '(prefers-color-scheme: dark)', color: '#252836' },
  ],
};

// Provide default OpenGraph metadata unless specific pages
// override it.
export const metadata: Metadata = DEFAULT_OPENGRAPH_METADATA;

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
