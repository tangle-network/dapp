import '@webb-tools/webb-ui-components/tailwind.css';
import '../styles/globals.css';

import { Footer, useDarkMode } from '@webb-tools/webb-ui-components';
import { AppProps } from 'next/app';
import { DefaultSeo, DefaultSeoProps } from 'next-seo';
import { useEffect } from 'react';

import Header from '../components/Header';
import Provider from '../provider';

export const metadata: DefaultSeoProps = {
  additionalLinkTags: [
    {
      href: 'https://webb.tools/static/assets/favicon.png',
      rel: 'icon',
    },
  ],
  defaultTitle: 'Webb Faucet',
  description:
    'Our easy-to-use crypto faucet website allows you to claim free WebTNT with just a few clicks. Start earning fast and hassle-free payouts today!',
  openGraph: {
    images: [
      {
        alt: 'Og Image Alt',
        height: 1800,
        url: 'https://webb-assets.s3.amazonaws.com/og.png',
        width: 2400,
      },
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
    url: 'https://faucet.webb.tools/',
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
    import('@johanaarstein/dotlottie-player');
    setIsDarkMode('light');
  }, [setIsDarkMode]);

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
