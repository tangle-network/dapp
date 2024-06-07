'use client';

import { isAppEnvironmentType } from '@webb-tools/dapp-config/types';
import {
  AppsLine,
  ArrowLeftRightLineIcon,
  DocumentationIcon,
  FundsLine,
  GiftLineIcon,
  GlobalLine,
  GridFillIcon,
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
import { LocalStorageKey } from '../../hooks/useLocalStorage';

const isForcedDevelopmentEnv = (): boolean => {
  // Allow the use of the `USE_DEV_ENV` local storage key
  // to force the use of the development environment. This is useful
  // for development previews, where the NODE_ENV is set to production
  // by Netlify.
  return window.localStorage.getItem(LocalStorageKey.USE_DEV_ENV) !== null;
};

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
    Icon: ArrowLeftRightLineIcon,
    subItems: [],
    environments: ['development', 'staging', 'test'],
  },
  {
    name: 'Services',
    href: '',
    isInternal: true,
    isNext: true,
    Icon: GridFillIcon,
    environments: ['development', 'staging', 'test'],
    subItems: [
      {
        name: 'Overview',
        href: PagePath.SERVICES_OVERVIEW,
        isInternal: true,
        isNext: true,
      },
      {
        name: 'Restake',
        href: PagePath.SERVICES_RESTAKE,
        isInternal: true,
        isNext: true,
      },
    ],
  },
  {
    name: 'Nomination',
    href: PagePath.NOMINATION,
    isInternal: true,
    isNext: true,
    Icon: FundsLine,
    subItems: [],
  },
  {
    name: 'Liquid Staking',
    href: PagePath.LIQUID_RESTAKING,
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

    return item.environments.includes(currentEnv) || isForcedDevelopmentEnv();
  });

  return {
    ClosedLogo: SidebarTangleClosedIcon,
    Logo: TangleLogo,
    footer: SIDEBAR_FOOTER,
    items,
    logoLink: TANGLE_MKT_URL,
  } satisfies SidebarProps;
}
