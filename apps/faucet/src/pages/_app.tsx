import '@webb-tools/webb-ui-components/tailwind.css';

import { AppProps } from 'next/app';
import Head from 'next/head';
import { useDarkMode, WebbUIProvider } from '@webb-tools/webb-ui-components';

import '../styles/globals.css';

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <WebbUIProvider>
      <Head>
        <title>Welcome to faucet!</title>
      </Head>
      <main className="app">
        <Component {...pageProps} />
      </main>
    </WebbUIProvider>
  );
}

export default CustomApp;
