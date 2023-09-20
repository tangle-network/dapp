import '@webb-tools/webb-ui-components/tailwind.css';
import '../styles/globals.css';

import { Footer, useDarkMode } from '@webb-tools/webb-ui-components';
import {
  WEBB_FAUCET_URL,
  WEBB_MKT_URL,
} from '@webb-tools/webb-ui-components/constants';
import { AppProps } from 'next/app';
import { DefaultSeo, DefaultSeoProps } from 'next-seo';
import { useEffect } from 'react';

import Header from '../components/Header';
import Provider from '../provider';

export const metadata: DefaultSeoProps = {
  additionalLinkTags: [
    {
      href: new URL('/static/assets/favicon.png', WEBB_MKT_URL).toString(),
      rel: 'icon',
    },
  ],
  defaultTitle: 'Webb Faucet',
  description:
    'Our easy-to-use testnet faucet allows you to claim test tokens with just a few clicks. Start experimenting with Hubble Bridge today.',
  openGraph: {
    images: [
      {
        alt: 'Optimized Og Image Alt',
        height: 630,
        url: 'https://webb-assets.s3.amazonaws.com/og-optimize.png',
        width: 1200,
      },
    ],
    locale: 'en_US',
    siteName: 'Webb Faucet',
    type: 'website',
    url: WEBB_FAUCET_URL,
  },
  themeColor: '#ffffff',
  titleTemplate: 'Webb | %s',
  twitter: {
    cardType: 'summary_large_image',
    handle: '@webbprotocol',
    site: '@webbprotocol',
  },
};

const App = ({ Component, pageProps }: AppProps) => {
  const [, setIsDarkMode] = useDarkMode();

  // Dynamic loading the lottie player in client side
  useEffect(() => {
    setIsDarkMode('light');
  }, [setIsDarkMode]);

  return (
    <Provider>
      <DefaultSeo {...metadata} />
      <div>
        <Header />

        <main className="mt-[72px]">
          <Component {...pageProps} />
        </main>

        <Footer isMinimal isNext className="py-12 m-0 mx-auto mt-4" />
      </div>
    </Provider>
  );
};

export default App;
