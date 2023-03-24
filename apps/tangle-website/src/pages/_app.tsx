import { AppProps } from 'next/app';
import Script from 'next/script';
import Head from 'next/head';
import '@webb-tools/webb-ui-components/tailwind.css';
import '../styles/globals.css';
import './styles.css';
import { Header } from '../components';
import { WebbUIProvider } from '@webb-tools/webb-ui-components';

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <WebbUIProvider>
      <Head>
        <title>Welcome to tangle-website!</title>
      </Head>

      <Header />

      <main className="app">
        <Component {...pageProps} />
        <Script
          defer
          data-domain="webb.tools"
          src="https://plausible.io/js/script.js"
        />
      </main>
    </WebbUIProvider>
  );
}

export default CustomApp;
