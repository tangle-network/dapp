import { MobileSidebar as MobileSidebarCmp } from '@webb-tools/webb-ui-components';
import { useLocation } from 'react-router';
import { FC } from 'react';

import useSidebarProps from './useSidebarProps';

const MobileSidebar: FC = () => {
  const location = useLocation();
  const sidebarProps = useSidebarProps();

  return (
    <MobileSidebarCmp
      {...sidebarProps}
      pathnameOrHash={location.pathname}
      className="lg:hidden"
    />
  );
};

export default MobileSidebar;
