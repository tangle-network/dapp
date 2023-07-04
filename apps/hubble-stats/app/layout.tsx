'use client';

import { useEffect } from 'react';
import Head from 'next/head';
import {
  WebbUIProvider,
  useDarkMode,
  Footer,
  SideBar,
  Logo,
  LogoWithoutName,
} from '@webb-tools/webb-ui-components';
import '@webb-tools/webb-ui-components/tailwind.css';
import { ContrastTwoLine, DocumentationIcon, Tangle } from '@webb-tools/icons';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [, setIsDarkMode] = useDarkMode();

  useEffect(() => {
    setIsDarkMode('light');
  }, [setIsDarkMode]);

  const items = [
    {
      name: 'Hubble',
      isInternal: true,
      href: 'https://app.webb.tools/#/bridge',
      Icon: ContrastTwoLine,
      subItems: [
        {
          name: 'Bridge',
          isInternal: false,
          href: 'https://app.webb.tools/#/bridge',
        },
        {
          name: 'Explorer',
          isInternal: true,
          href: '',
        },
        {
          name: 'Faucet',
          isInternal: false,
          href: 'https://develop--webb-faucet.netlify.app/',
        },
      ],
    },
    {
      name: 'Tangle Network',
      isInternal: true,
      href: '',
      Icon: Tangle,
      subItems: [
        {
          name: 'DKG Explorer',
          isInternal: false,
          href: 'https://stats.webb.tools/#/keys',
        },
        {
          name: 'Homepage',
          isInternal: false,
          href: 'https://tangle.webb.tools/',
        },
      ],
    },
  ];

  const footer = {
    name: 'Webb Docs',
    isInternal: false,
    href: 'https://docs.webb.tools/',
    Icon: DocumentationIcon,
  };

  return (
    <html lang="en">
      <WebbUIProvider defaultThemeMode="light">
        <Head>
          <title>Welcome to Hubble Stats!</title>
        </Head>
        <body className="bg-body dark:bg-body_dark bg-cover flex overflow-hidden">
          <SideBar
            items={items}
            Logo={Logo}
            ClosedLogo={LogoWithoutName}
            footer={footer}
          />
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-[1000px] mx-auto">
              {children}
              <Footer isMinimal style={{ background: 'inherit' }} />
            </div>
          </main>
        </body>
      </WebbUIProvider>
    </html>
  );
}
