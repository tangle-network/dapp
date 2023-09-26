import '@webb-tools/webb-ui-components/tailwind.css';
import { Metadata } from 'next';
import { HUBBLE_STATS_URL } from '@webb-tools/webb-ui-components/constants';

import { Layout } from '../containers';
import { NextThemeProvider } from './providers';

export const metadata: Metadata = {
  title: {
    default: 'Welcome to Hubble Stats!',
    template: 'Hubble Stats | %s',
  },
  description: 'Welcome to Hubble Stats!',
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
  themeColor: '#ffffff',
  icons: {
    icon: '/favicon.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hubble Stats',
    description: 'Welcome to Hubble Stats!',
  },
};

// revalidate every 5 seconds
export const revalidate = 5;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex h-screen bg-body">
        <NextThemeProvider>
          <Layout>{children}</Layout>
        </NextThemeProvider>
      </body>
    </html>
  );
}
