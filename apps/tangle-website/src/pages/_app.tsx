import { DefaultSeo } from 'next-seo';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { WebbUIProvider, WebsiteFooter } from '@webb-tools/webb-ui-components';
import '@webb-tools/webb-ui-components/tailwind.css';
import '../styles/globals.css';
import { Header } from '../components';
import Script from 'next/script';

function CustomApp({ Component, pageProps }: AppProps) {
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
              url: '/static/assets/seo.png',
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

      <Header />

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
