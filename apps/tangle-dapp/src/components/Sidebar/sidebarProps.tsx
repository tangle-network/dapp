import {
  AppsLine,
  CoinLine,
  DocumentationIcon,
  GiftLineIcon,
  GlobalLine,
  HomeFillIcon,
  PolkadotJs,
  ShuffleLine,
  TokenSwapFill,
  WaterDropletIcon,
} from '@tangle-network/icons';
import {
  MobileSidebarProps,
  SideBarFooterType,
  SideBarItemProps,
  TangleLogo,
} from '@tangle-network/ui-components';
import { SidebarTangleClosedIcon } from '@tangle-network/ui-components/components';
import {
  TANGLE_DOCS_URL,
  TANGLE_MKT_URL,
} from '@tangle-network/ui-components/constants';
import { PointsBanner } from '../../features/points/components/PointsBanner';
import { PagePath } from '../../types';

// TODO: This entire system of handling sidebar props can be improved in a more React-compliant manner. For now, leaving as is since it is not necessary.
// Only show the services dropdown if on development mode.
const SIDEBAR_STATIC_ITEMS: SideBarItemProps[] = [
  {
    name: 'Dashboard',
    href: PagePath.DASHBOARD,
    isInternal: true,
    Icon: HomeFillIcon,
    subItems: [],
  },
  {
    name: 'Restake',
    href: PagePath.RESTAKE,
    isInternal: true,
    Icon: TokenSwapFill,
    subItems: [],
  },
  {
    name: 'Liquid Stake',
    href: PagePath.LIQUID_STAKING,
    isInternal: true,
    Icon: WaterDropletIcon,
    subItems: [],
  },
  {
    name: 'Bridge',
    href: PagePath.BRIDGE,
    isInternal: true,
    Icon: ShuffleLine,
    subItems: [],
  },
  {
    name: 'Nomination',
    href: PagePath.NOMINATION,
    isInternal: true,
    Icon: CoinLine,
    subItems: [],
  },
  {
    name: 'Claim Airdrop',
    href: PagePath.CLAIM_AIRDROP,
    isInternal: true,
    Icon: GiftLineIcon,
    subItems: [],
  },
];

const SIDEBAR_FOOTER: SideBarFooterType = {
  Icon: DocumentationIcon,
  href: TANGLE_DOCS_URL,
  isInternal: false,
  name: 'Docs',
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
    footer: {
      ...SIDEBAR_FOOTER,
      extraContent: <PointsBanner />,
    },
    items,
    logoLink: TANGLE_MKT_URL,
  } satisfies MobileSidebarProps;
}
