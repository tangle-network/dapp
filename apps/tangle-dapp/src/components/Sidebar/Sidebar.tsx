import { SideBar as SideBarCmp } from '@tangle-network/ui-components';
import { type FC } from 'react';
import { useLocation } from 'react-router';

import useSidebarProps from './useSidebarProps';

interface SidebarProps {
  isExpandedByDefault?: boolean;
}

const Sidebar: FC<SidebarProps> = ({ isExpandedByDefault }) => {
  const location = useLocation();
  const sidebarProps = useSidebarProps();

  return (
    <SideBarCmp
      {...sidebarProps}
      pathnameOrHash={location.pathname}
      className="hidden lg:block !z-0"
      isExpandedByDefault={isExpandedByDefault}
    />
  );
};

export default Sidebar;
