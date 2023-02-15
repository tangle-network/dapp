// core styles shared by all of react-notion-x (required)
import 'react-notion-x/src/styles.css';
import '@webb-tools/webb-ui-components/tailwind.css';
import '../styles/globals.css';
import { DefaultSeo } from 'next-seo';
import { AppProps } from 'next/app';
import { useEffect } from 'react';
import { Header, Footer } from '../components';

function CustomApp({ Component, pageProps }: AppProps) {
  // Dynamic loading the lottie player in client side
  useEffect(() => {
    import('@johanaarstein/dotlottie-player');
  }, []);

  return (
    <>
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
      </main>

      <Footer />
    </>
  );
}

export default CustomApp;
