import { SideBar as SideBarCmp } from '@tangle-network/webb-ui-components';
import { setSidebarCookieOnToggle } from '@tangle-network/webb-ui-components/next-utils';
import { useLocation } from 'react-router';
import { type FC } from 'react';

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
      onSideBarToggle={setSidebarCookieOnToggle}
    />
  );
};

export default Sidebar;
