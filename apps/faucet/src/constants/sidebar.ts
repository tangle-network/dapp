import {
  TANGLE_TESTNET_EVM_EXPLORER_URL,
  TANGLE_TESTNET_NATIVE_EXPLORER_URL,
} from '@webb-tools/dapp-config/constants/tangle';
import {
  AppsLine,
  DocumentationIcon,
  FaucetIcon,
  GlobalLine,
  KeyIcon,
} from '@webb-tools/icons';
import {
  type SideBarFooterType,
  type SideBarItemProps,
  type SidebarProps,
  TangleLogo,
} from '@webb-tools/webb-ui-components';
import { SidebarTangleClosedIcon } from '@webb-tools/webb-ui-components/components';
import {
  DKG_STATS_AUTHORITIES_URL,
  DKG_STATS_KEYS_URL,
  DKG_STATS_PROPOSALS_URL,
  TANGLE_DOCS_URL,
  TANGLE_MKT_URL,
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
    Icon: KeyIcon,
    href: '',
    isInternal: false,
    name: 'DKG Explorer',
    subItems: [
      {
        href: DKG_STATS_KEYS_URL,
        isInternal: false,
        name: 'Keys',
      },
      {
        href: DKG_STATS_AUTHORITIES_URL,
        isInternal: false,
        name: 'Authorities',
      },
      {
        href: DKG_STATS_PROPOSALS_URL,
        isInternal: false,
        name: 'Proposals',
      },
    ],
  },
  {
    Icon: FaucetIcon,
    href: '/',
    isInternal: true,
    isNext: true,
    name: 'Faucet',
    subItems: [],
  },
  {
    Icon: AppsLine,
    href: TANGLE_TESTNET_NATIVE_EXPLORER_URL,
    isInternal: false,
    name: 'Substrate Portal',
    subItems: [],
  },
  {
    Icon: GlobalLine,
    href: TANGLE_TESTNET_EVM_EXPLORER_URL,
    isInternal: false,
    name: 'EVM Explorer',
    subItems: [],
  },
];

const footer: SideBarFooterType = {
  Icon: DocumentationIcon,
  href: TANGLE_DOCS_URL,
  isInternal: false,
  name: 'Tangle Docs',
  useNextThemesForThemeToggle: true,
};

const sidebar: SidebarProps = {
  ClosedLogo: SidebarTangleClosedIcon,
  Logo: TangleLogo,
  footer: footer,
  items: items,
  logoLink: TANGLE_MKT_URL,
};

export default sidebar;
