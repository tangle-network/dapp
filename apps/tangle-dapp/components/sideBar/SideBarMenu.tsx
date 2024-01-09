'use client';

import { SideBarMenu as SideBarMenuCmp } from '@webb-tools/webb-ui-components';
import { usePathname } from 'next/navigation';
import { FC } from 'react';

import sideBarProps from './sideBarProps';

const SideBarMenu: FC = () => {
  const pathname = usePathname();

  return (
    <SideBarMenuCmp
      {...sideBarProps}
      pathnameOrHash={pathname}
      className="lg:hidden"
    />
  );
};

export default SideBarMenu;
