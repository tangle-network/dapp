'use client';

import { MobileSidebar as MobileSidebarCmp } from '@webb-tools/webb-ui-components';
import { usePathname } from 'next/navigation';
import { FC } from 'react';

import useSidebarProps from './useSidebarProps';

const MobileSidebar: FC = () => {
  const pathname = usePathname();
  const sidebarProps = useSidebarProps();

  return (
    <MobileSidebarCmp
      {...sidebarProps}
      pathnameOrHash={pathname}
      className="lg:hidden"
    />
  );
};

export default MobileSidebar;
