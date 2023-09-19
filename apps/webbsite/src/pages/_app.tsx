// core styles shared by all of react-notion-x (required)
import '@webb-tools/webb-ui-components/tailwind.css';
import 'react-notion-x/src/styles.css';

import {
  useDarkMode,
  WebbUIProvider,
  WebsiteFooter,
} from '@webb-tools/webb-ui-components';
import { WEBB_MKT_URL } from '@webb-tools/webb-ui-components/constants';
import { DefaultSeo } from 'next-seo';
import { AppProps } from 'next/app';
import Script from 'next/script';
import { useEffect } from 'react';

import { Header } from '../components';
import '../styles/globals.css';

function CustomApp({ Component, pageProps }: AppProps) {
  const [, setIsDarkMode] = useDarkMode();
  useEffect(() => {
    setIsDarkMode('light');
  }, [setIsDarkMode]);

  return (
    <WebbUIProvider>
      <DefaultSeo
        defaultTitle="Welcome to Webb!"
        titleTemplate="Webb | %s"
        themeColor="#ffffff"
        additionalLinkTags={[
          {
            rel: 'icon',
            href: '/static/assets/favicon.png',
          },
        ]}
        openGraph={{
          type: 'website',
          locale: 'en_US',
          url: WEBB_MKT_URL,
          images: [
            {
              url: 'https://webb-assets.s3.amazonaws.com/og-optimize.png',
              width: 1200,
              height: 630,
              alt: 'Optimized Og Image Alt',
            },
          ],
        }}
        twitter={{
          handle: '@webbprotocol',
          site: '@webbprotocol',
          cardType: 'summary_large_image',
        }}
      />

      <Header />

      <main className="app">
        <Component {...pageProps} />
        <Script
          defer
          data-domain={WEBB_MKT_URL}
          src="https://plausible.io/js/script.js"
        />
      </main>

      <WebsiteFooter type="webbsite" />
    </WebbUIProvider>
  );
}

export default CustomApp;
