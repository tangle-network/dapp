import '@webb-tools/webb-ui-components/tailwind.css';
import '../styles/globals.css';

import { WEBB_FAUCET_URL } from '@webb-tools/webb-ui-components/constants';
import { AppProps } from 'next/app';
import { DefaultSeo, DefaultSeoProps } from 'next-seo';

import Provider from '../provider';

export const metadata: DefaultSeoProps = {
  additionalLinkTags: [
    {
      href: '/static/assets/favicon.png',
      rel: 'icon',
    },
  ],
  defaultTitle: 'Tangle Network Faucet',
  description:
    'Receive Test Tokens on Devnet and Testnet supported by Tangle Network and Webb Protocol for development and experimental purposes.',
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
    siteName: 'Tangle Network Faucet',
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
  return (
    <Provider>
      <DefaultSeo {...metadata} />

      <main>
        <Component {...pageProps} />
      </main>
    </Provider>
  );
};

export default App;
