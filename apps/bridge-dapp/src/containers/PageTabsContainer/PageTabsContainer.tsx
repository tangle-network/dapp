import cx from 'classnames';
import { type FC, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import {
  BRIDGE_TABS,
  WRAPPER_TABS,
  BRIDGE_PATH,
  WRAPPER_PATH,
} from '../../constants/index.js';
import type { PageTabsContainerProps } from './types.js';

const PageTabsContainer: FC<PageTabsContainerProps> = ({
  children,
  pageType,
  settingBtnProps,
  className,
  ...props
}) => {
  const { pathname } = useLocation();

  const rootPath = useMemo(
    () => (pageType === 'bridge' ? BRIDGE_PATH : WRAPPER_PATH),
    [pageType]
  );

  const tabs = useMemo(
    () => (pageType === 'bridge' ? BRIDGE_TABS : WRAPPER_TABS),
    [pageType]
  );

  // Find active tab from pathname
  const activeTab = useMemo(
    () =>
      pathname.split('/').find((path) => !!tabs.find((tab) => tab === path)),
    [pathname, tabs]
  );

  return (
    <div
      {...props}
      className={twMerge(
        'w-full max-w-xl min-h-[var(--card-height)]',
        'h-full bg-mono-0 dark:bg-mono-190',
        'mx-auto rounded-xl space-y-4 grow',
        'border border-mono-40 dark:border-mono-160 py-8 px-4 md:!px-9',
        'flex flex-col',
        'shadow-webb-lg dark:shadow-webb-lg-dark',
        className
      )}
    >
      <ul className="flex items-center gap-4 pb-2 overflow-x-scroll">
        {tabs.map((tab, idx) => (
          <li key={`${tab}-${idx}`}>
            <Link
              to={`/${rootPath}/${tab}`}
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
      </ul>

      {children}
    </div>
  );
};

export default PageTabsContainer;
