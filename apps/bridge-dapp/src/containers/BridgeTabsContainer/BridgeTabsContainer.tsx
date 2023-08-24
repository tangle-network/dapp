import cx from 'classnames';
import { Link, useLocation } from 'react-router-dom';
import { BRIDGE_TABS } from '../../constants';
import { FC, PropsWithChildren } from 'react';

const BridgeTabsContainer: FC<PropsWithChildren> = ({ children }) => {
  const { pathname } = useLocation();

  // Find active tab from pathname
  const activeTab = pathname
    .split('/')
    .find((path) => BRIDGE_TABS.includes(path));

  return (
    <div
      className={cx(
        'w-full lg:max-w-xl min-h-[710px] h-full bg-mono-0 dark:bg-mono-190',
        'p-9 rounded-xl space-y-4 grow',
        'border border-mono-40 dark:border-mono-160',
        'flex flex-col'
      )}
    >
      <ul className="flex items-center space-x-4">
        {BRIDGE_TABS.map((tab, idx) => (
          <li key={`${tab}-${idx}`}>
            <Link
              to={`/bridge/${tab}`}
              className={cx(
                'h4 font-bold',
                activeTab === tab
                  ? 'dark:radix-state-active:!text-mono-0'
                  : 'text-mono-100 radix-state-active:text-mono-200'
              )}
            >
              {`${tab[0].toUpperCase()}${tab.substring(1)}`}
            </Link>
          </li>
        ))}
      </ul>

      {children}
    </div>
  );
};

export default BridgeTabsContainer;
