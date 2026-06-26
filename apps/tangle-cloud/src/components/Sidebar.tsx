import {
  CoinsLineIcon,
  DocumentationIcon,
  GiftLineIcon,
  GlobalLine,
  GridFillIcon,
  HomeFillIcon,
  ShieldKeyholeLineIcon,
} from '@tangle-network/icons';
import {
  MobileSidebar as MobileSidebarCmp,
  type MobileSidebarProps,
  SideBar as SideBarCmp,
  type SideBarFooterType,
  type SideBarItemProps,
  TangleLogo,
} from '@tangle-network/ui-components';
import { SidebarTangleClosedIcon } from '@tangle-network/ui-components/components';
import {
  TANGLE_DOCS_URL,
  TANGLE_MKT_URL,
} from '@tangle-network/ui-components/constants';
import { type FC, useMemo } from 'react';
import { useLocation } from 'react-router';
import { PagePath } from '../types';

type Props = {
  isExpandedByDefault?: boolean;
  onExpandedChange?: () => void;
};

const SIDEBAR_ITEMS: SideBarItemProps[] = [
  {
    name: 'Dashboard',
    href: PagePath.INSTANCES,
    isInternal: true,
    Icon: HomeFillIcon,
    subItems: [],
  },
  {
    name: 'Blueprints',
    href: PagePath.BLUEPRINTS,
    isInternal: true,
    Icon: GridFillIcon,
    subItems: [],
  },
  {
    name: 'Operators',
    href: PagePath.OPERATORS,
    isInternal: true,
    Icon: GlobalLine,
    subItems: [],
  },
  {
    name: 'Rewards',
    href: PagePath.REWARDS,
    isInternal: true,
    Icon: GiftLineIcon,
    subItems: [],
  },
  {
    name: 'Earnings',
    href: PagePath.EARNINGS,
    isInternal: true,
    Icon: CoinsLineIcon,
    subItems: [],
  },
  {
    name: 'Payments',
    href: PagePath.PAYMENTS_POOL,
    isInternal: true,
    Icon: ShieldKeyholeLineIcon,
    subItems: [],
  },
];

const SIDEBAR_FOOTER: SideBarFooterType = {
  name: 'Docs',
  href: TANGLE_DOCS_URL,
  isInternal: false,
  Icon: DocumentationIcon,
};

const useCloudSidebarProps = (): MobileSidebarProps =>
  useMemo(
    () => ({
      ClosedLogo: SidebarTangleClosedIcon,
      Logo: TangleLogo,
      footer: SIDEBAR_FOOTER,
      items: SIDEBAR_ITEMS,
      logoLink: TANGLE_MKT_URL,
    }),
    [],
  );

const Sidebar: FC<Props> = ({ isExpandedByDefault, onExpandedChange }) => {
  const location = useLocation();
  const sidebarProps = useCloudSidebarProps();

  return (
    <SideBarCmp
      {...sidebarProps}
      className="fixed inset-y-0 left-0 z-50 hidden lg:block"
      isExpandedByDefault={isExpandedByDefault}
      onSideBarToggle={onExpandedChange}
      pathnameOrHash={location.pathname}
    />
  );
};

export const MobileSidebar: FC = () => {
  const location = useLocation();
  const sidebarProps = useCloudSidebarProps();

  return (
    <MobileSidebarCmp
      {...sidebarProps}
      className="lg:hidden"
      pathnameOrHash={location.pathname}
    />
  );
};

export default Sidebar;
