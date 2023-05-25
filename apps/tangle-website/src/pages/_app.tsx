import { DefaultSeo } from 'next-seo';
import { AppProps } from 'next/app';
import Head from 'next/head';
import {
  WebbUIProvider,
  WebsiteFooter,
  useDarkMode,
} from '@webb-tools/webb-ui-components';
import '@webb-tools/webb-ui-components/tailwind.css';
import '../styles/globals.css';
import { Header } from '../components';
import Script from 'next/script';
import { useEffect } from 'react';

function CustomApp({ Component, pageProps }: AppProps) {
  const [, setIsDarkMode] = useDarkMode();

  useEffect(() => {
    setIsDarkMode('light');
  }, [setIsDarkMode]);

  return (
    <WebbUIProvider defaultThemeMode="light">
      <DefaultSeo
        defaultTitle="Welcome to Tangle Network!"
        titleTemplate="Tangle Network | %s"
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
          url: 'https://tangle.webb.tools/',
          images: [
            {
              url: 'https://webb-cms.s3.amazonaws.com/tangle_seo.png',
              width: 2000,
              height: 1050,
              alt: 'Og Image Alt',
            },
          ],
        }}
        twitter={{
          handle: '@webbprotocol',
          site: '@webbprotocol',
          cardType: 'summary_large_image',
        }}
      />

      <Head>
        <title>Welcome to Tangle Website!</title>
      </Head>

      <Header hideBanner />

      <main className="app">
        <Component {...pageProps} />

        <Script
          defer
          data-domain="tangle.webb.tools"
          src="https://plausible.io/js/script.js"
        />
      </main>

      <WebsiteFooter type="tangle" />
    </WebbUIProvider>
  );
}

export default CustomApp;
