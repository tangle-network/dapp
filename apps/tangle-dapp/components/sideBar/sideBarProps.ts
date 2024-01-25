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
  TANGLE_MKT_URL,
  TANGLE_TESTNET_EXPLORER_URL,
  TANGLE_TESTNET_NATIVE_EXPLORER_URL,
  WEBB_TANGLE_DOCS_URL,
} from '@webb-tools/webb-ui-components/constants';

import { InternalPath } from '../../types';

const sideBarItems: SideBarItemProps[] = [
  {
    name: 'Account',
    href: InternalPath.Account,
    isInternal: true,
    isNext: true,
    Icon: UserLineIcon,
    subItems: [],
  },
  {
    name: 'EVM Staking',
    href: InternalPath.EvmStaking,
    isInternal: true,
    isNext: true,
    Icon: FundsLine,
    subItems: [],
  },
  {
    name: 'Claim Airdrop',
    href: InternalPath.Claim,
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
