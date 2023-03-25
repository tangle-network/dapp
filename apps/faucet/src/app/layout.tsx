import '@webb-tools/webb-ui-components/tailwind.css';
import { Metadata } from 'next';

import { FC, PropsWithChildren } from 'react';
import { Footer } from '../components';
import Provider from '../provider';

import '../styles/globals.css';
import Header from './Header';

export const metadata: Metadata = {
  title: {
    default: 'Webb Faucet',
    template: 'Webb | %s',
  },
  description:
    'Our easy-to-use crypto faucet website allows you to claim free WebTNT with just a few clicks. Start earning fast and hassle-free payouts today!',
  themeColor: '#ffffff',
  icons: {
    icon: '/static/assets/favicon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://faucet.webb.tools/',
    siteName: 'Webb Faucet',
    images: [
      {
        url: '/static/assets/og.png',
        width: 2400,
        height: 1800,
        alt: 'Og Image Alt',
      },
      {
        url: '/static/assets/og-optimize.png',
        width: 1200,
        height: 630,
        alt: 'Optimized Og Image Alt',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@webbprotocol',
  },
};

const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <html lang="en">
      <body className="min-h-[calc(100vh-72px)]">
        <Header />

        <Provider>
          <main className="mt-[72px]">{children}</main>
        </Provider>

        <Footer isNext />
      </body>
    </html>
  );
};

export default Layout;
