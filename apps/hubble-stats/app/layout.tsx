'use client';

import { useEffect } from 'react';
import Head from 'next/head';
import {
  WebbUIProvider,
  useDarkMode,
  Footer,
} from '@webb-tools/webb-ui-components';
import '@webb-tools/webb-ui-components/tailwind.css';
import { Header } from '../components/Header';

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
        <body className="bg-body dark:bg-body_dark bg-cover flex h-screen">
          {/* Slide Navigation */}
          <nav className="w-[280px] h-full"></nav>

          {/* Main Body */}
          <main className="flex-[1]">
            <div className="max-w-[1000px] mx-auto">
              <Header />
              {children}
              <Footer isMinimal style={{ background: 'inherit' }} />
            </div>
          </main>
        </body>
      </WebbUIProvider>
    </html>
  );
}
