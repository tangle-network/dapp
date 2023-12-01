import '@webb-tools/webb-ui-components/tailwind.css';

import { TESTNET_LEADERBOARD_URL } from '@webb-tools/webb-ui-components/constants';
import type { Metadata } from 'next';
import Script from 'next/script';

import Footer from '../components/Footer';
import Header from '../components/Header';
import Providers from './providers';

export const metadata: Metadata = {
  title: {
    default: 'Testnet Leaderboard',
    template: 'Testnet Leaderboard | %s',
  },
  description: 'Welcome to Testnet Leaderboard!',
  metadataBase: process.env.URL
    ? new URL(process.env.URL)
    : process.env.PORT
    ? new URL(`http://localhost:${process.env.PORT}`)
    : null,
  openGraph: {
    title: 'Testnet Leaderboard',
    description: 'Welcome to Testnet Leaderboard!',
    url: TESTNET_LEADERBOARD_URL,
    siteName: 'Testnet Leaderboard',
    images: [
      {
        url: '/assets/seo.png',
        width: 2000,
        height: 1050,
        alt: 'Og Image Alt',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  themeColor: '#ffffff',
  icons: {
    icon: '/assets/favicon.png',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@webbprotocol',
    creator: '@webbprotocol',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="box-border h-full p-0 m-0">
      <body className="box-border h-full p-0 m-0">
        <div className="min-h-full grid grid-rows-[auto_1fr_auto]">
          <Header className="grow-0 shrink-0" />

          <Providers>
            <main className="grow-1">{children}</main>
          </Providers>

          <Footer className="grow-0 shrink-0" />
        </div>

        <Script
          defer
          data-domain="leaderboard.tangle.tools"
          src="https://plausible.io/js/script.js"
        />
      </body>
    </html>
  );
}
