// core styles shared by all of react-notion-x (required)
import 'react-notion-x/src/styles.css';
import '@webb-tools/webb-ui-components/tailwind.css';
import '../styles/globals.css';
import { DefaultSeo } from 'next-seo';
import { AppProps } from 'next/app';
import Script from 'next/script';
import { useEffect } from 'react';
import { Header, Footer } from '../components';
import { useDarkMode, WebbUIProvider } from '@webb-tools/webb-ui-components';

function CustomApp({ Component, pageProps }: AppProps) {
  const [, setIsDarkMode] = useDarkMode();
  // Dynamic loading the lottie player in client side
  useEffect(() => {
    import('@johanaarstein/dotlottie-player');
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
          url: 'https://webb.tools/',
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
          data-domain="webb.tools"
          src="https://plausible.io/js/script.js"
        />
      </main>

      <Footer />
    </WebbUIProvider>
  );
}

export default CustomApp;
