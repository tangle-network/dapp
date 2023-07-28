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
import {
  CoinIcon,
  ContrastLine,
  ContrastTwoLine,
  DocumentationIcon,
  GridFillIcon,
  Tangle,
} from '@webb-tools/icons';
import {
  BRIDGE_URL,
  WEBB_FAUCET_URL,
  STATS_URL,
  TANGLE_MKT_URL,
  WEBB_DOCS_URL,
  WEBB_MKT_URL,
} from '@webb-tools/webb-ui-components/constants';
import { usePathname } from 'next/navigation';
import { Breadcrumb, Header } from '../components';
import { useMemo } from 'react';

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

  const pathname = usePathname();

  const breadCrumbs = useMemo(() => {
    const parts = pathname.split('/');
    const activeItem = parts[parts.length - 1];

    const breadCrumbItems: Breadcrumb[] = [
      {
        label: 'Hubble Overview',
        isLast: activeItem !== '' ? false : true,
        icon: (
          <ContrastLine className={activeItem !== '' ? 'fill-mono-120' : ''} />
        ),
        href: '/',
      },
    ];

    if (activeItem !== '') {
      breadCrumbItems.push({
        label: activeItem,
        isLast: true,
        icon: <CoinIcon />,
        href: '',
      });
    }

    return breadCrumbItems;
  }, [pathname]);

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
            <Header
              breadcrumbs={breadCrumbs}
              tvlValue="$13,642,124"
              volumeValue="$8,562,122"
            />
            {children}
            <Footer isMinimal style={{ background: 'inherit' }} />
          </main>
        </body>
      </WebbUIProvider>
    </html>
  );
}
