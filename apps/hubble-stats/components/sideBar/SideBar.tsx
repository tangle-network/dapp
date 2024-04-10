'use client';

import { type FC } from 'react';
import { SideBar as SideBarCmp } from '@webb-tools/webb-ui-components';
import { setSidebarCookieOnToggle } from '@webb-tools/webb-ui-components/next-utils';
import sideBarProps from './sideBarProps';

interface SideBarProps {
  isExpandedAtDefault?: boolean;
}

const SideBar: FC<SideBarProps> = ({ isExpandedAtDefault }) => {
  return (
    <SideBarCmp
      {...sideBarProps}
      className="hidden lg:block"
      isExpandedAtDefault={isExpandedAtDefault}
      onSideBarToggle={() => setSidebarCookieOnToggle()}
    />
  );
};

export default SideBar;
