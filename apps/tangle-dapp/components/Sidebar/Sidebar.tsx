'use client';

import { SideBar as SideBarCmp } from '@webb-tools/webb-ui-components';
import { setSidebarCookieOnToggle } from '@webb-tools/webb-ui-components/next-utils';
import { usePathname } from 'next/navigation';
import { type FC } from 'react';

import useSidebarProps from './useSidebarProps';

interface SidebarProps {
  isExpandedByDefault?: boolean;
}

const Sidebar: FC<SidebarProps> = ({ isExpandedByDefault }) => {
  const pathname = usePathname();
  const sidebarProps = useSidebarProps();

  return (
    <SideBarCmp
      {...sidebarProps}
      pathnameOrHash={pathname}
      className="hidden lg:block !z-0"
      isExpandedByDefault={isExpandedByDefault}
      onSideBarToggle={setSidebarCookieOnToggle}
    />
  );
};

export default Sidebar;
