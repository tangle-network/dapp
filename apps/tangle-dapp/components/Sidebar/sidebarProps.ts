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

  // Filter the sidebar items based on the current environment
  const items = sideBarItems.filter((item) => {
    if (!item.environments) {
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
