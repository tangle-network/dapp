import {
  AppsLine,
  DocumentationIcon,
  FundsLine,
  GiftLineIcon,
  GlobalLine,
  GridFillIcon,
  UserLineIcon,
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

const sideBarStaticItems: SideBarItemProps[] = [
  {
    name: 'Account',
    href: PagePath.ACCOUNT,
    isInternal: true,
    isNext: true,
    Icon: UserLineIcon,
    subItems: [],
  },
  {
    name: 'Services',
    href: '',
    isInternal: true,
    isNext: true,
    Icon: GridFillIcon,
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
    name: 'Claim Airdrop',
    href: PagePath.CLAIM_AIRDROP,
    isInternal: true,
    isNext: true,
    Icon: GiftLineIcon,
    subItems: [],
  },
];

const sideBarFooter: SideBarFooterType = {
  Icon: DocumentationIcon,
  href: TANGLE_DOCS_URL,
  isInternal: false,
  name: 'Tangle Docs',
  useNextThemesForThemeToggle: true,
};

export default function getSideBarProps(
  substratePortalHref?: string,
  evmExplorerHref?: string
): SidebarProps {
  const sideBarItems: SideBarItemProps[] = [
    ...sideBarStaticItems,
    ...(substratePortalHref
      ? [
          {
            Icon: AppsLine,
            href: substratePortalHref,
            isInternal: false,
            name: 'Substrate Portal',
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

  return {
    ClosedLogo: SidebarTangleClosedIcon,
    Logo: TangleLogo,
    footer: sideBarFooter,
    items: sideBarItems,
    logoLink: TANGLE_MKT_URL,
  } satisfies SidebarProps;
}
