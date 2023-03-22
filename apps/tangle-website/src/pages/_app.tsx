// core styles shared by all of react-notion-x (required)
import 'react-notion-x/src/styles.css';
import '@webb-tools/webb-ui-components/tailwind.css';
import '../styles/globals.css';
import { AppProps } from 'next/app';
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
      </main>

      <Footer />
    </WebbUIProvider>
  );
}

export default CustomApp;
