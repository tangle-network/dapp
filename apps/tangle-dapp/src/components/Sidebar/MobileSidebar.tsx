import { MobileSidebar as MobileSidebarCmp } from '@webb-tools/webb-ui-components';
import { useLocation } from 'react-router-dom';
import { FC } from 'react';

import useSidebarProps from './useSidebarProps';

const MobileSidebar: FC = () => {
  const { pathname } = useLocation();
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
