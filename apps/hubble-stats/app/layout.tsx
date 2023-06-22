'use client';

import { useEffect } from 'react';
import Head from 'next/head';
import {
  WebbUIProvider,
  useDarkMode,
  Footer,
} from '@webb-tools/webb-ui-components';
import '@webb-tools/webb-ui-components/tailwind.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [, setIsDarkMode] = useDarkMode();

  useEffect(() => {
    setIsDarkMode('light');
  }, [setIsDarkMode]);

  return (
    <html lang="en">
      <WebbUIProvider defaultThemeMode="light">
        <Head>
          <title>Welcome to Hubble Stats!</title>
        </Head>
        <body>
          {children}
          <Footer isMinimal />
        </body>
      </WebbUIProvider>
    </html>
  );
}
