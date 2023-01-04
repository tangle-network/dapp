import '@webb-tools/webb-ui-components/tailwind.css';
import '../styles/globals.css';

import { AppProps } from 'next/app';
import Head from 'next/head';

import { useEffect } from 'react';
import Footer from '../components/Footer';
import { useEffect } from 'react';

function CustomApp({ Component, pageProps }: AppProps) {
  // Dynamic loading the lottie player in client side
  useEffect(() => {
    import('@lottiefiles/lottie-player');
  }, []);

  return (
    <>
      <Head>
        <title>Welcome to Webb!</title>
        <link rel="icon" href="/static/assets/favicon.png" />
      </Head>

      <Header />

      <main className="app">
        <Component {...pageProps} />
      </main>

      <Footer />
    </>
  );
}

export default CustomApp;
