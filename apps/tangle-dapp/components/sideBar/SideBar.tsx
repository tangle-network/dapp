'use client';

import { type FC } from 'react';
import { SideBar as SideBarCmp } from '@webb-tools/webb-ui-components';
import { setSideBarCookieOnToggle } from '@webb-tools/browser-utils';
import SideBarProps from './sideBarProps';

interface SideBarProps {
  isExpandedAtDefault?: boolean;
}

const SideBar: FC<SideBarProps> = ({ isExpandedAtDefault }) => {
  return (
    <SideBarCmp
      {...SideBarProps}
      className="hidden lg:block"
      isExpandedAtDefault={isExpandedAtDefault}
      onSideBarToggle={() => setSideBarCookieOnToggle()}
    />
  );
};

export default SideBar;
