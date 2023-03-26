import '@webb-tools/webb-ui-components/tailwind.css';
import '../styles/globals.css';

import { Footer } from '@webb-tools/webb-ui-components';
import { AppProps } from 'next/app';
import { DefaultSeo, DefaultSeoProps } from 'next-seo';

import Header from '../components/Header';
import Provider from '../provider';

export const metadata: DefaultSeoProps = {
  defaultTitle: 'Webb Faucet',
  titleTemplate: 'Webb | %s',
  description:
    'Our easy-to-use crypto faucet website allows you to claim free WebTNT with just a few clicks. Start earning fast and hassle-free payouts today!',
  themeColor: '#ffffff',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://faucet.webb.tools/',
    siteName: 'Webb Faucet',
    images: [
      {
        url: 'https://webb-assets.s3.amazonaws.com/og.png',
        width: 2400,
        height: 1800,
        alt: 'Og Image Alt',
      },
      {
        url: 'https://webb-assets.s3.amazonaws.com/og-optimize.png',
        width: 1200,
        height: 630,
        alt: 'Optimized Og Image Alt',
      },
    ],
  },
  twitter: {
    cardType: 'summary_large_image',
    handle: '@webbprotocol',
    site: '@webbprotocol',
  },
  additionalLinkTags: [
    {
      rel: 'icon',
      href: 'https://webb.tools/static/assets/favicon.png',
    },
  ],
};

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <Provider>
      <DefaultSeo {...metadata} />
      <Header />

      <main className="mt-[72px]">
        <Component {...pageProps} />
      </main>

      <Footer isNext />
    </Provider>
  );
};

export default App;
