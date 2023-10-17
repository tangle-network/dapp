'use client';

import { FC } from 'react';
import { SideBarMenu as SideBarMenuCmp } from '@webb-tools/webb-ui-components';

import sideBarProps from './sideBarProps';

const SideBarMenu: FC = () => {
  return <SideBarMenuCmp {...sideBarProps} className="lg:hidden" />;
};

export default SideBarMenu;
