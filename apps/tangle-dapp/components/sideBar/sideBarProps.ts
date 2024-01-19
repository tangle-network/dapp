import {
  AppsLine,
  DocumentationIcon,
  FundsLine,
  GiftLineIcon,
  GlobalLine,
} from '@webb-tools/icons';
import {
  type SideBarFooterType,
  type SideBarItemProps,
  type SidebarProps,
  TangleLogo,
} from '@webb-tools/webb-ui-components';
import { SidebarTangleClosedIcon } from '@webb-tools/webb-ui-components/components';
import {
  TANGLE_MKT_URL,
  TANGLE_TESTNET_NATIVE_EXPLORER_URL,
  TANGLE_TESTNET_EXPLORER_URL,
  WEBB_TANGLE_DOCS_URL,
} from '@webb-tools/webb-ui-components/constants';

const sideBarItems: SideBarItemProps[] = [
  {
    name: 'EVM Staking',
    href: '/',
    isInternal: true,
    isNext: true,
    Icon: FundsLine,
    subItems: [],
  },
  {
    name: 'Claim',
    href: '/claim',
    isInternal: true,
    isNext: true,
    Icon: GiftLineIcon,
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
