'use client';

import { SideBar as SideBarCmp } from '@webb-tools/webb-ui-components';
import { setSideBarCookieOnToggle } from '@webb-tools/webb-ui-components/next-utils';
import { usePathname } from 'next/navigation';
import { type FC } from 'react';

import sideBarProps from './sideBarProps';

interface SideBarProps {
  isExpandedAtDefault?: boolean;
}

const SideBar: FC<SideBarProps> = ({ isExpandedAtDefault }) => {
  const pathname = usePathname();

  return (
    <SideBarCmp
      {...sideBarProps}
      pathnameOrHash={pathname}
      className="hidden lg:block !z-0"
      isExpandedAtDefault={isExpandedAtDefault}
      onSideBarToggle={() => setSideBarCookieOnToggle()}
    />
  );
};

export default SideBar;
