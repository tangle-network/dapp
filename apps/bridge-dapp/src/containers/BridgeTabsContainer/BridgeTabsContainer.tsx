import SettingsFillIcon from '@webb-tools/icons/SettingsFillIcon';
import cx from 'classnames';
import { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { BRIDGE_TABS } from '../../constants';
import { BridgeTabsContainerProps } from './types';
import { IconButton } from '@webb-tools/webb-ui-components';

const BridgeTabsContainer: FC<BridgeTabsContainerProps> = ({
  children,
  settingBtnProps,
  className,
  ...props
}) => {
  const { pathname } = useLocation();

  // Find active tab from pathname
  const activeTab = pathname
    .split('/')
    .find((path) => !!BRIDGE_TABS.find((tab) => tab === path));

  return (
    <div
      {...props}
      className={twMerge(
        'w-full max-w-xl min-h-[var(--card-height)] h-full bg-mono-0 dark:bg-mono-190',
        'p-9 mx-auto rounded-xl space-y-4 grow',
        'border border-mono-40 dark:border-mono-160',
        'flex flex-col',
        className
      )}
    >
      <ul className="flex items-center gap-4 pb-4 overflow-x-scroll">
        {BRIDGE_TABS.map((tab, idx) => (
          <li key={`${tab}-${idx}`}>
            <Link
              to={`/bridge/${tab}`}
              className={cx(
                'h4 font-bold',
                activeTab === tab
                  ? 'text-mono-200 dark:text-mono-0'
                  : 'text-mono-100'
              )}
            >
              {`${tab[0].toUpperCase()}${tab.substring(1)}`}
            </Link>
          </li>
        ))}

        <li key={`button`} className="last:ml-auto" title="Setting">
          <IconButton {...settingBtnProps}>
            <SettingsFillIcon size="lg" />
          </IconButton>
        </li>
      </ul>

      {children}
    </div>
  );
};

export default BridgeTabsContainer;
