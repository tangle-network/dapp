import '@webb-tools/webb-ui-components/tailwind.css';
import '../styles/globals.css';

import NextThemeProvider from '@webb-tools/api-provider-environment/NextThemeProvider';
import { Footer, SideBar, useDarkMode } from '@webb-tools/webb-ui-components';
import { WEBB_FAUCET_URL } from '@webb-tools/webb-ui-components/constants';
import { AppProps } from 'next/app';
import { DefaultSeo, DefaultSeoProps } from 'next-seo';
import { useEffect, useState } from 'react';

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
  const [shouldShowSidebar, setShouldShowSidebar] = useState(true);

  // Dynamic loading the lottie player in client side
  useEffect(() => {
    setIsDarkMode('light');
  }, [setIsDarkMode]);

  // need to check for screen size to hide sidebar on mobile because of non-unique ids problem with svg: https://stackoverflow.com/a/55846525
  // if check with className, the Tangle logo icon will disappear on mobile and tablet since there will be 2 SVG with same id
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setShouldShowSidebar(false);
      } else {
        setShouldShowSidebar(true);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Provider>
      <DefaultSeo {...metadata} />
      <NextThemeProvider>
        <div className="h-screen flex">
          {shouldShowSidebar && <SideBar {...sidebarProps} />}
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
