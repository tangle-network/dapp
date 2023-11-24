import '@webb-tools/webb-ui-components/tailwind.css';

import { TANGLE_DAPP_URL } from '@webb-tools/webb-ui-components/constants';
import { Metadata } from 'next';
import type React from 'react';

import { Layout } from '../containers';
import Providers from './providers';

export const metadata: Metadata = {
  title: {
    default: 'Tangle Dapp',
    template: 'Tangle Dapp | %s',
  },
  description: 'Welcome to Tangle Dapp!',
  metadataBase: process.env.URL
    ? new URL(process.env.URL)
    : new URL(`http://localhost:${process.env.PORT}`),
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
  themeColor: '#ffffff',
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
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
