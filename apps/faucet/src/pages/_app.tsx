import '@webb-tools/webb-ui-components/tailwind.css';

import { WebbUIProvider } from '@webb-tools/webb-ui-components';
import { DefaultSeo, DefaultSeoProps } from 'next-seo';
import { AppProps } from 'next/app';

import '../styles/globals.css';

const defaultMetadata: DefaultSeoProps = {
  defaultTitle: 'Webb Faucet',
  titleTemplate: 'Webb | %s',
  description:
    'Our easy-to-use crypto faucet website allows you to claim free WebTNT with just a few clicks. Start earning fast and hassle-free payouts today!',
  themeColor: '#ffffff',
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/static/assets/favicon.png',
    },
  ],
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
    handle: '@webbprotocol',
    site: '@webbprotocol',
    cardType: 'summary_large_image',
  },
};

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <DefaultSeo {...defaultMetadata} />

      <WebbUIProvider defaultThemeMode="light">
        <main className="app">
          <Component {...pageProps} />
        </main>
      </WebbUIProvider>
    </>
  );
}

export default CustomApp;
