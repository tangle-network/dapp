'use client';

import { isAppEnvironmentType } from '@webb-tools/dapp-config/types';
import {
  AppsLine,
  CoinLine,
  DocumentationIcon,
  GiftLineIcon,
  GlobalLine,
  GridFillIcon,
  PolkadotJs,
  ShuffleLine,
  TokenSwapFill,
  UserFillIcon,
  WaterDropletIcon,
} from '@webb-tools/icons';
import {
  SideBarFooterType,
  SideBarItemProps,
  SidebarProps,
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
    isNext: true,
    Icon: UserFillIcon,
    subItems: [],
  },
  {
    name: 'Bridge',
    href: PagePath.BRIDGE,
    isInternal: true,
    isNext: true,
    Icon: ShuffleLine,
    subItems: [],
    environments: ['development', 'staging', 'test'],
  },
  {
    name: 'Blueprints',
    href: PagePath.BLUEPRINTS,
    isInternal: true,
    isNext: true,
    Icon: GridFillIcon,
    subItems: [],
    environments: ['development', 'staging', 'test'],
  },
  {
    name: 'Restake',
    href: PagePath.RESTAKE,
    isInternal: true,
    isNext: true,
    Icon: TokenSwapFill,
    environments: ['development', 'staging', 'test'],
    subItems: [],
  },
  {
    name: 'Nominate',
    href: PagePath.NOMINATION,
    isInternal: true,
    isNext: true,
    Icon: CoinLine,
    subItems: [],
  },
  {
    name: 'Liquid Stake',
    href: PagePath.LIQUID_STAKING_OVERVIEW,
    environments: ['development', 'staging', 'test'],
    isInternal: true,
    isNext: true,
    Icon: WaterDropletIcon,
    subItems: [],
  },
  {
    name: 'Claim Airdrop',
    href: PagePath.CLAIM_AIRDROP,
    isInternal: true,
    isNext: true,
    Icon: GiftLineIcon,
    subItems: [],
  },
];

const SIDEBAR_FOOTER: SideBarFooterType = {
  Icon: DocumentationIcon,
  href: TANGLE_DOCS_URL,
  isInternal: false,
  name: 'Tangle Docs',
  useNextThemesForThemeToggle: true,
};

export default function getSidebarProps({
  polkadotJsDashboardUrl,
  nativeExplorerUrl,
  evmExplorerUrl,
}: {
  polkadotJsDashboardUrl: string;
  nativeExplorerUrl?: string;
  evmExplorerUrl?: string;
}): SidebarProps {
  const currentEnv = isAppEnvironmentType(process.env.NODE_ENV)
    ? process.env.NODE_ENV
    : 'development';

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
    if (item.environments === undefined) {
      return true;
    }

    return item.environments.includes(currentEnv);
  });

  return {
    ClosedLogo: SidebarTangleClosedIcon,
    Logo: TangleLogo,
    footer: SIDEBAR_FOOTER,
    items,
    logoLink: TANGLE_MKT_URL,
  } satisfies SidebarProps;
}
