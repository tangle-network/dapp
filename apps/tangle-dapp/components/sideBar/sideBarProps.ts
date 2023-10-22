import {
  AppsLine,
  DocumentationIcon,
  FaucetIcon,
  GlobalLine,
  KeyIcon,
  FundsLine,
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
  TANGLE_MKT_URL,
  TANGLE_STANDALONE_EXPLORER_URL,
  TANGLE_TESTNET_EXPLORER_URL,
  WEBB_TANGLE_DOCS_URL,
  WEBB_FAUCET_URL,
} from '@webb-tools/webb-ui-components/constants';

const sideBarItems: SideBarItemProps[] = [
  {
    name: 'EVM Staking',
    href: '/',
    isInternal: true,
    Icon: FundsLine,
    subItems: [],
  },
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
    href: WEBB_FAUCET_URL,
    isInternal: false,
    name: 'Faucet',
    subItems: [],
  },
  {
    Icon: AppsLine,
    href: TANGLE_STANDALONE_EXPLORER_URL,
    isInternal: false,
    name: 'Substrate Portal',
    subItems: [],
  },
  {
    Icon: GlobalLine,
    href: TANGLE_TESTNET_EXPLORER_URL,
    isInternal: false,
    name: 'EVM Explorer',
    subItems: [],
  },
];

const sideBarFooter: SideBarFooterType = {
  Icon: DocumentationIcon,
  href: WEBB_TANGLE_DOCS_URL,
  isInternal: false,
  name: 'Tangle Docs',
  useNextThemesForThemeToggle: true,
};

const sideBarProps: SidebarProps = {
  ClosedLogo: SidebarTangleClosedIcon,
  Logo: TangleLogo,
  footer: sideBarFooter,
  items: sideBarItems,
  logoLink: TANGLE_MKT_URL,
};

export default sideBarProps;
