'use client';

import { FC } from 'react';
import { SideBar as SideBarCmp } from '@webb-tools/webb-ui-components';

import sideBarProps from './sideBarProps';

const SideBar: FC = () => {
  return <SideBarCmp {...sideBarProps} className="hidden lg:block" />;
};

export default SideBar;
