'use client';

import { SideBarMenu as SideBarMenuCmp } from '@webb-tools/webb-ui-components';
import { usePathname } from 'next/navigation';
import { FC } from 'react';

import useSidebarProps from './useSidebarProps';

const SidebarMenu: FC = () => {
  const pathname = usePathname();
  const sidebarProps = useSidebarProps();

  return (
    <SideBarMenuCmp
      {...sidebarProps}
      pathnameOrHash={pathname}
      className="lg:hidden"
    />
  );
};

export default SidebarMenu;
