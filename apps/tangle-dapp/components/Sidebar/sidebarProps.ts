'use client';

import { isAppEnvironmentType } from '@webb-tools/dapp-config/types';
import {
  AppsLine,
  CoinLine,
  DocumentationIcon,
  GiftLineIcon,
  GlobalLine,
  ShuffleLine,
  TokenSwapFill,
  UserLineIcon,
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
    Icon: UserLineIcon,
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
    name: 'Restake',
    // The default restake page is the deposit page.
    href: PagePath.RESTAKE_DEPOSIT,
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
    href: PagePath.LIQUID_STAKING,
    environments: ['development', 'staging', 'test'],
    isInternal: true,
    isNext: true,
    Icon: WaterDropletIcon,
    subItems: [],
  },
  {
    name: 'Claim',
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

export default function getSidebarProps(
  substrateExplorerHref?: string,
  evmExplorerHref?: string,
): SidebarProps {
  const currentEnv = isAppEnvironmentType(process.env.NODE_ENV)
    ? process.env.NODE_ENV
    : 'development';

  const sideBarItems: SideBarItemProps[] = [
    ...SIDEBAR_STATIC_ITEMS,
    ...(substrateExplorerHref
      ? [
          {
            Icon: AppsLine,
            href: substrateExplorerHref,
            isInternal: false,
            name: 'Substrate Explorer',
            subItems: [],
          },
        ]
      : []),
    ...(evmExplorerHref
      ? [
          {
            Icon: GlobalLine,
            href: evmExplorerHref,
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
