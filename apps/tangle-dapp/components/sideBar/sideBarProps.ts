import {
  AppsLine,
  DocumentationIcon,
  FundsLine,
  GiftLineIcon,
  GlobalLine,
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
  TANGLE_TESTNET_EXPLORER_URL,
  TANGLE_TESTNET_NATIVE_EXPLORER_URL,
} from '@webb-tools/webb-ui-components/constants';

import { PagePath } from '../../types';

const sideBarItems: SideBarItemProps[] = [
  {
    name: 'Account',
    href: PagePath.Account,
    isInternal: true,
    isNext: true,
    Icon: UserLineIcon,
    subItems: [],
  },
  {
    name: 'Nomination',
    href: PagePath.EvmStaking,
    isInternal: true,
    isNext: true,
    Icon: FundsLine,
    subItems: [],
  },
  {
    name: 'Claim Airdrop',
    href: PagePath.ClaimAirdrop,
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
  href: TANGLE_DOCS_URL,
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
