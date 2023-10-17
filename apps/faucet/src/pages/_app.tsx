import '@webb-tools/webb-ui-components/tailwind.css';
import '../styles/globals.css';

import { Footer, SideBar, useDarkMode } from '@webb-tools/webb-ui-components';
import { WEBB_FAUCET_URL } from '@webb-tools/webb-ui-components/constants';
import NextThemeProvider from '@webb-tools/api-provider-environment/NextThemeProvider';
import { AppProps } from 'next/app';
import { DefaultSeo, DefaultSeoProps } from 'next-seo';
import { useEffect } from 'react';

import Header from '../components/Header';
import sidebarProps from '../constants/sidebar';
import Provider from '../provider';

export const metadata: DefaultSeoProps = {
  additionalLinkTags: [
    {
      href: '/static/assets/favicon.png',
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
      <NextThemeProvider>
        <div className="h-screen flex">
          <SideBar {...sidebarProps} className="hidden lg:flex" />
          <main className="flex-[1] h-full overflow-y-auto">
            <div className="mx-3 md:mx-5 lg:mx-10 space-y-4">
              <Header />

              <main>
                <Component {...pageProps} />
              </main>

              <Footer isMinimal isNext className="py-12 mx-auto" />
            </div>
          </main>
        </div>
      </NextThemeProvider>
    </Provider>
  );
};

export default App;
