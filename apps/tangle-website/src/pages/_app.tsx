import { AppProps } from 'next/app';
import Head from 'next/head';
import { WebbUIProvider } from '@webb-tools/webb-ui-components';
import '@webb-tools/webb-ui-components/tailwind.css';
import '../styles/globals.css';

import { Header } from '../components';

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <WebbUIProvider defaultThemeMode="light">
      <Head>
        <title>Welcome to tangle-website!</title>
      </Head>

      <Header />

      <main className="app">
        <Component {...pageProps} />
      </main>
    </WebbUIProvider>
  );
}

export default CustomApp;
