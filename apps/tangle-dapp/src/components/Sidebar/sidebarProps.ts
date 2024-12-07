'use client';

import {
  AppsLine,
  CoinLine,
  DocumentationIcon,
  GiftLineIcon,
  GlobalLine,
  GridFillIcon,
  HomeFillIcon,
  PolkadotJs,
  ShuffleLine,
  TokenSwapFill,
  WaterDropletIcon,
} from '@webb-tools/icons';
import {
  MobileSidebarProps,
  SideBarFooterType,
  SideBarItemProps,
  TangleLogo,
} from '@webb-tools/webb-ui-components';
import { SidebarTangleClosedIcon } from '@webb-tools/webb-ui-components/components';
import {
  TANGLE_DOCS_URL,
  TANGLE_MKT_URL,
} from '@webb-tools/webb-ui-components/constants';

import { PagePath } from '../../types';

// TODO: This entire system of handling sidebar props can be improved in a more React-compliant manner. For now, leaving as is since it is not necessary.
// Only show the services dropdown if on development mode.
const SIDEBAR_STATIC_ITEMS: SideBarItemProps[] = [
  {
    name: 'Account',
    href: PagePath.ACCOUNT,
    isInternal: true,
    isNext: false,
    Icon: HomeFillIcon,
    subItems: [],
  },
  {
    name: 'Bridge',
    href: PagePath.BRIDGE,
    isInternal: true,
    isNext: false,
    Icon: ShuffleLine,
    subItems: [],
  },
  {
    name: 'Blueprints',
    href: PagePath.BLUEPRINTS,
    isInternal: true,
    isNext: false,
    Icon: GridFillIcon,
    subItems: [],
    hideInProduction: true,
  },
  {
    name: 'Restake',
    href: PagePath.RESTAKE,
    isInternal: true,
    isNext: false,
    Icon: TokenSwapFill,
    subItems: [],
  },
  {
    name: 'Nominate',
    href: PagePath.NOMINATION,
    isInternal: true,
    isNext: false,
    Icon: CoinLine,
    subItems: [],
  },
  {
    name: 'Liquid Stake',
    href: PagePath.LIQUID_STAKING,
    isInternal: true,
    isNext: false,
    Icon: WaterDropletIcon,
    subItems: [],
  },
  {
    name: 'Claim Airdrop',
    href: PagePath.CLAIM_AIRDROP,
    isInternal: true,
    isNext: false,
    Icon: GiftLineIcon,
    subItems: [],
  },
];

const SIDEBAR_FOOTER: SideBarFooterType = {
  Icon: DocumentationIcon,
  href: TANGLE_DOCS_URL,
  isInternal: false,
  name: 'Docs',
  useNextThemesForThemeToggle: false,
};

export default function getSidebarProps({
  polkadotJsDashboardUrl,
  nativeExplorerUrl,
  evmExplorerUrl,
}: {
  polkadotJsDashboardUrl: string;
  nativeExplorerUrl?: string;
  evmExplorerUrl?: string;
}): MobileSidebarProps {
  const isProductionEnv = import.meta.env.PROD;

  const sideBarItems: SideBarItemProps[] = [
    ...SIDEBAR_STATIC_ITEMS,
    {
      Icon: PolkadotJs,
      href: polkadotJsDashboardUrl,
      isInternal: false,
      name: 'Polkadot-JS',
      subItems: [],
    },
    ...(nativeExplorerUrl
      ? [
          {
            Icon: AppsLine,
            href: nativeExplorerUrl,
            isInternal: false,
            name: 'Substrate Explorer',
            subItems: [],
          },
        ]
      : []),
    ...(evmExplorerUrl
      ? [
          {
            Icon: GlobalLine,
            href: evmExplorerUrl,
            isInternal: false,
            name: 'EVM Explorer',
            subItems: [],
          },
        ]
      : []),
  ];

  // Filter the sidebar items based on the current environment.
  // This is useful to keep development-only items hidden in production.
  const items = sideBarItems.filter((item) => {
    return (
      item.hideInProduction === undefined ||
      !item.hideInProduction ||
      !isProductionEnv
    );
  });

  return {
    ClosedLogo: SidebarTangleClosedIcon,
    Logo: TangleLogo,
    footer: SIDEBAR_FOOTER,
    items,
    logoLink: TANGLE_MKT_URL,
  } satisfies MobileSidebarProps;
}
