'use client';

import { HomeIcon } from '@radix-ui/react-icons';
import CommandFillIcon from '@webb-tools/icons/CommandFillIcon';
import { DocumentationIcon } from '@webb-tools/icons/DocumentationIcon';
import GlobalLine from '@webb-tools/icons/GlobalLine';
import { GridFillIcon } from '@webb-tools/icons/GridFillIcon';
import {
  MobileSidebar,
  SideBar as SideBarCmp,
  SideBarFooterType,
  SideBarItemProps,
  SidebarTangleClosedIcon,
} from '@webb-tools/webb-ui-components/components/SideBar';
import { TangleCloudLogo } from '@webb-tools/webb-ui-components/components/TangleCloudLogo';
import {
  TANGLE_DAPP_URL,
  TANGLE_DOCS_URL,
} from '@webb-tools/webb-ui-components/constants';
import { setSidebarCookieOnToggle } from '@webb-tools/webb-ui-components/next-utils';
import { usePathname } from 'next/navigation';
import { FC } from 'react';
import { PagePath } from '../types';

type Props = {
  isExpandedByDefault?: boolean;
};

const SIDEBAR_ITEMS: SideBarItemProps[] = [
  {
    name: 'Home',
    href: PagePath.HOME,
    isInternal: true,
    isNext: true,
    Icon: HomeIcon,
    subItems: [],
  },
  {
    name: 'Blueprints',
    href: PagePath.BLUEPRINTS,
    isInternal: true,
    isNext: true,
    Icon: GridFillIcon,
    subItems: [],
  },
  {
    name: 'Operators',
    href: PagePath.OPERATORS,
    isInternal: true,
    isNext: true,
    Icon: GlobalLine,
    subItems: [],
  },

  // External links
  {
    Icon: CommandFillIcon,
    href: TANGLE_DAPP_URL,
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
  const pathname = usePathname();

  return (
    <>
      {/* Large screen sidebar */}
      <SideBarCmp
        ClosedLogo={SidebarTangleClosedIcon}
        items={SIDEBAR_ITEMS}
        footer={SIDEBAR_FOOTER}
        Logo={TangleCloudLogo}
        logoLink={pathname}
        pathnameOrHash={pathname}
        className="hidden h-screen lg:block"
        isExpandedByDefault={isExpandedByDefault}
        onSideBarToggle={setSidebarCookieOnToggle}
      />

      {/* Small screen sidebar */}
      <MobileSidebar
        ClosedLogo={SidebarTangleClosedIcon}
        items={SIDEBAR_ITEMS}
        footer={SIDEBAR_FOOTER}
        Logo={TangleCloudLogo}
        logoLink={pathname}
        pathnameOrHash={pathname}
        className="fixed top-[34px] left-4 md:left-8 lg:hidden"
      />
    </>
  );
};

export default Sidebar;
