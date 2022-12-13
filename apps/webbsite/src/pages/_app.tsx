import { AppProps } from 'next/app';
import Head from 'next/head';
import '@webb-tools/webb-ui-components/tailwind.css';

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Welcome to webbsite!</title>
        <link rel="icon" href="/static/assets/favicon.png" />
      </Head>
      <main className="app">
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default CustomApp;
