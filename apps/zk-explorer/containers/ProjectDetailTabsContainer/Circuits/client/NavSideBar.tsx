import { type FC } from 'react';
import cx from 'classnames';
import { Typography } from '@webb-tools/webb-ui-components';
import { SideBarLine } from '@webb-tools/icons';

interface NavSideBarProps {
  isCollapsed?: boolean;
}

const NavSideBar: FC<NavSideBarProps> = ({ isCollapsed }) => {
  return (
    <div className="p-2">
      <div
        className={cx('flex items-center', { 'justify-center': isCollapsed })}
      >
        <div className="p-2">
          <SideBarLine className="dark:!fill-mono-0" />
        </div>
        {!isCollapsed && (
          <Typography
            variant="body2"
            fw="bold"
            className="!text-mono-200 dark:!text-mono-0"
          >
            Files
          </Typography>
        )}
      </div>
    </div>
  );
};

export default NavSideBar;
