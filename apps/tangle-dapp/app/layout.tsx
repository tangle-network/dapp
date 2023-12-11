import '@webb-tools/webb-ui-components/tailwind.css';

import Suspense from '@webb-tools/webb-ui-components/components/Suspense';
import { TANGLE_DAPP_URL } from '@webb-tools/webb-ui-components/constants';
import type { Metadata, Viewport } from 'next';
import type React from 'react';

import { Layout } from '../containers';
import Providers from './providers';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fff' },
    { media: '(prefers-color-scheme: dark)', color: '#252836' },
  ],
};

export const metadata: Metadata = {
  title: {
    default: 'Tangle Dapp',
    template: 'Tangle Dapp | %s',
  },
  description: 'Welcome to Tangle Dapp!',
  metadataBase: process.env.URL
    ? new URL(process.env.URL)
    : process.env.PORT != null
    ? new URL(`http://localhost:${process.env.PORT}`)
    : null,
  openGraph: {
    title: 'Tangle Dapp',
    description: 'Welcome to Tangle Dapp!',
    url: TANGLE_DAPP_URL,
    siteName: 'Tangle Dapp',
    images: [
      {
        alt: 'Optimized Og Image Alt',
        height: 630,
        url: 'https://webb-assets.s3.amazonaws.com/og-optimize.png',
        width: 1200,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  icons: {
    icon: '/favicon.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tangle Dapp',
    description: 'Welcome to Tangle Dapp!',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Suspense>
          <Providers>
            <Layout>{children}</Layout>
          </Providers>
        </Suspense>
      </body>
    </html>
  );
}
