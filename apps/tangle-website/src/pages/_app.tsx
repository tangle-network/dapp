import { AppProps } from 'next/app';
import Head from 'next/head';
import '@webb-tools/webb-ui-components/tailwind.css';
import '../styles/globals.css'
import './styles.css';

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Welcome to tangle-website!</title>
      </Head>
      <main className="app">
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default CustomApp;
