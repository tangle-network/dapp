'use client';

import {
  WebbUIProvider,
  Footer,
  SideBar,
  Logo,
  LogoWithoutName,
  ItemProps,
  FooterProps,
} from '@webb-tools/webb-ui-components';
import '@webb-tools/webb-ui-components/tailwind.css';
import { ContrastTwoLine, DocumentationIcon, Tangle } from '@webb-tools/icons';
import {
  BRIDGE_URL,
  WEBB_FAUCET_URL,
  STATS_URL,
  TANGLE_MKT_URL,
  WEBB_DOCS_URL,
  WEBB_MKT_URL,
} from '@webb-tools/webb-ui-components/constants';
import { Header } from '../components';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const items: ItemProps[] = [
    {
      name: 'Hubble',
      isInternal: true,
      href: '',
      Icon: ContrastTwoLine,
      subItems: [
        {
          name: 'Bridge',
          isInternal: false,
          href: BRIDGE_URL,
        },
        {
          name: 'Explorer',
          isInternal: true,
          href: '',
        },
        {
          name: 'Faucet',
          isInternal: false,
          href: WEBB_FAUCET_URL,
        },
      ],
    },
    {
      name: 'Tangle Network',
      isInternal: false,
      href: '',
      Icon: Tangle,
      subItems: [
        {
          name: 'DKG Explorer',
          isInternal: false,
          href: STATS_URL,
        },
        {
          name: 'Homepage',
          isInternal: false,
          href: TANGLE_MKT_URL,
        },
      ],
    },
  ];

  const footer: FooterProps = {
    name: 'Webb Docs',
    isInternal: false,
    href: WEBB_DOCS_URL,
    Icon: DocumentationIcon,
  };

  return (
    <html lang="en">
      <WebbUIProvider defaultThemeMode="light">
        <body className="h-screen bg-body dark:bg-body_dark bg-cover flex">
          <SideBar
            items={items}
            Logo={Logo}
            ClosedLogo={LogoWithoutName}
            logoLink={WEBB_MKT_URL}
            footer={footer}
          />

          <main className="flex-1 px-10 overflow-y-auto">
            <Header />
            {children}
            <Footer isMinimal style={{ background: 'inherit' }} />
          </main>
        </body>
      </WebbUIProvider>
    </html>
  );
}
