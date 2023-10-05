'use client';

import { type FC } from 'react';
import { SideBar as SideBarCmp } from '@webb-tools/webb-ui-components';

import { setSideBarCookieOnToggle } from './sideBarActions';
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
      onSideBarToggle={() => setSideBarCookieOnToggle()}
    />
  );
};

export default SideBar;
