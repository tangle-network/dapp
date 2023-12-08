import '@webb-tools/webb-ui-components/tailwind.css';

import Providers from './providers';
import { HUBBLE_STATS_URL } from '@webb-tools/webb-ui-components/constants';
import type { Metadata, Viewport } from 'next';

import { Layout } from '../containers';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fff' },
    { media: '(prefers-color-scheme: dark)', color: '#252836' },
  ],
};

export const metadata: Metadata = {
  title: {
    default: 'Hubble Stats',
    template: 'Hubble Stats | %s',
  },
  description: 'Welcome to Hubble Stats!',
  metadataBase: process.env.URL ? new URL(process.env.URL) : null,
  openGraph: {
    title: 'Hubble Stats',
    description: 'Welcome to Hubble Stats!',
    url: HUBBLE_STATS_URL,
    siteName: 'Hubble Stats',
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
    title: 'Hubble Stats',
    description: 'Welcome to Hubble Stats!',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex h-screen bg-body">
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
