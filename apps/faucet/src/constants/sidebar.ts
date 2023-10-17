import {
  TangleIcon,
  GridFillIcon,
  FundsLine,
  KeyIcon,
  FaucetIcon,
  AppsLine,
  GlobalLine,
  DocumentationIcon,
} from '@webb-tools/icons';
import {
  TangleLogo,
  type SideBarFooterType,
  type SideBarItemProps,
  type SidebarProps,
} from '@webb-tools/webb-ui-components';
import { SidebarTangleClosedIcon } from '@webb-tools/webb-ui-components/components';
import {
  DKG_STATS_KEYS_URL,
  DKG_STATS_AUTHORITIES_URL,
  DKG_STATS_PROPOSALS_URL,
  TANGLE_MKT_URL,
  WEBB_DOCS_URL,
  TANGLE_STANDALONE_EXPLORER_URL,
  TANGLE_TESTNET_EXPLORER_URL,
} from '@webb-tools/webb-ui-components/constants';

const items: SideBarItemProps[] = [
  // NOTE: these are under development
  // {
  //   name: 'Dashboard',
  //   isInternal: false,
  //   href: '/',
  //   Icon: GridFillIcon,
  //   subItems: [],
  // },
  // {
  //   name: 'EVM Staking',
  //   isInternal: false,
  //   href: '/',
  //   Icon: FundsLine,
  //   subItems: [],
  // },
  {
    name: 'DKG Explorer',
    isInternal: false,
    href: '',
    Icon: KeyIcon,
    subItems: [
      {
        name: 'Keys',
        isInternal: false,
        href: DKG_STATS_KEYS_URL,
      },
      {
        name: 'Authorities',
        isInternal: false,
        href: DKG_STATS_AUTHORITIES_URL,
      },
      {
        name: 'Proposals',
        isInternal: false,
        href: DKG_STATS_PROPOSALS_URL,
      },
    ],
  },
  {
    name: 'Faucet',
    isInternal: true,
    href: '/',
    Icon: FaucetIcon,
    subItems: [],
  },
  {
    name: 'Substrate Portal',
    isInternal: false,
    href: TANGLE_STANDALONE_EXPLORER_URL,
    Icon: AppsLine,
    subItems: [],
  },
  {
    name: 'EVM Explorer',
    isInternal: false,
    href: TANGLE_TESTNET_EXPLORER_URL,
    Icon: GlobalLine,
    subItems: [],
  },
];

const footer: SideBarFooterType = {
  name: 'Tangle Docs',
  isInternal: false,
  href: WEBB_DOCS_URL,
  Icon: DocumentationIcon,
  useNextThemesForThemeToggle: true,
};

const sidebar: SidebarProps = {
  Logo: TangleLogo,
  ClosedLogo: SidebarTangleClosedIcon,
  items: items,
  footer: footer,
  logoLink: TANGLE_MKT_URL,
};

export default sidebar;
