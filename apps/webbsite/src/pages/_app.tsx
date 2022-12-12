import '@webb-tools/webb-ui-components/tailwind.css';
import '../styles/globals.css';

import { AppProps } from 'next/app';
import Head from 'next/head';

import Header from '../components/Header';

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Welcome to webbsite!</title>
        <link rel="icon" href="/static/assets/favicon.png" />
      </Head>

      <Header />

      <main className="app">
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default CustomApp;
