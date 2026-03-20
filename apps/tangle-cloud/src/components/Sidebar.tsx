'use client';

import CommandFillIcon from '@tangle-network/icons/CommandFillIcon';
import { DocumentationIcon } from '@tangle-network/icons/DocumentationIcon';
import GlobalLine from '@tangle-network/icons/GlobalLine';
import { GridFillIcon } from '@tangle-network/icons/GridFillIcon';
import {
  MobileSidebar,
  SideBar as SideBarCmp,
  SideBarFooterType,
  SideBarItemProps,
  SidebarTangleClosedIcon,
} from '@tangle-network/ui-components/components/SideBar';
import { TangleCloudLogo } from '@tangle-network/ui-components/components/TangleCloudLogo';
import { TANGLE_DOCS_URL } from '@tangle-network/ui-components/constants';
import { FC } from 'react';
import { useLocation } from 'react-router';
import { PagePath, TANGLE_DAPP_BASE_URL } from '../types';
import {
  HomeFillIcon,
  GiftLineIcon,
  CoinsLineIcon,
  ShieldKeyholeLineIcon,
} from '@tangle-network/icons';

type Props = {
  isExpandedByDefault?: boolean;
};

const SIDEBAR_ITEMS: SideBarItemProps[] = [
  {
    name: 'Home',
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
    subItems: [
      {
        name: 'Shielded Pool',
        href: PagePath.PAYMENTS_POOL,
        isInternal: true,
      },
      {
        name: 'Credits',
        href: PagePath.PAYMENTS_CREDITS,
        isInternal: true,
      },
    ],
  },

  // External links
  {
    Icon: CommandFillIcon,
    href: TANGLE_DAPP_BASE_URL,
    isInternal: false,
    name: 'dApp',
    subItems: [],
  },
];

const SIDEBAR_FOOTER: SideBarFooterType = {
  Icon: DocumentationIcon,
  href: TANGLE_DOCS_URL,
  isInternal: false,
  name: 'Docs',
};

const Sidebar: FC<Props> = ({ isExpandedByDefault }) => {
  const pathname = useLocation().pathname;

  return (
    <>
      {/* Large screen sidebar */}
      <SideBarCmp
        ClosedLogo={SidebarTangleClosedIcon}
        items={SIDEBAR_ITEMS}
        footer={SIDEBAR_FOOTER}
        Logo={TangleCloudLogo}
        pathnameOrHash={pathname}
        className="hidden h-screen lg:block !z-10"
        isExpandedByDefault={isExpandedByDefault}
      />

      {/* Small screen sidebar */}
      <MobileSidebar
        ClosedLogo={SidebarTangleClosedIcon}
        items={SIDEBAR_ITEMS}
        footer={SIDEBAR_FOOTER}
        Logo={TangleCloudLogo}
        pathnameOrHash={pathname}
        className="fixed top-[34px] left-4 md:left-8 lg:hidden !z-10"
      />
    </>
  );
};

export default Sidebar;
