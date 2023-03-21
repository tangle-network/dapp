// core styles shared by all of react-notion-x (required)
import 'react-notion-x/src/styles.css';
import '@webb-tools/webb-ui-components/tailwind.css';
import '../styles/globals.css';
import { AppProps } from 'next/app';
import Script from 'next/script';
import { useEffect } from 'react';
import { Header, Footer } from '../components';
import { useDarkMode, WebbUIProvider } from '@webb-tools/webb-ui-components';

function CustomApp({ Component, pageProps }: AppProps) {
  const [, setIsDarkMode] = useDarkMode();
  useEffect(() => {
    setIsDarkMode('light');
  }, [setIsDarkMode]);

  return (
    <WebbUIProvider>
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
