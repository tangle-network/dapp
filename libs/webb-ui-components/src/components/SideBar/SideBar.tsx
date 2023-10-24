'use client';

import { TangleIcon, WebbLogoIcon } from '@webb-tools/icons';
import cx from 'classnames';
import { type FC, forwardRef, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import useLocalStorageState from 'use-local-storage-state';
import { SideBarFooter, SideBarItems, SideBarLogo } from '.';
import { SIDEBAR_OPEN_KEY } from '../../constants';
import { LogoProps } from '../Logo/types';
import { SidebarProps } from './types';
import { getCookieItem } from '../../utils';

/**
 * Sidebar Navigation Menu Component
 *
 * - `Logo`: The logo of the sidebar
 * - `ClosedLogo`: The logo of the sidebar when it is closed
 * - `items`: The items of the sidebar menu (see type `ItemProps`)
 * - `footer`: The footer of the sidebar menu (see type `FooterProps`)
 *
 * ```jsx
 *  // Example
 *  <SideBar
 *    Logo={Logo}
 *    ClosedLogo={ClosedLogo}
 *    items={items}
 *    footer={footer}
 *  />
 * ```
 */
export const SideBar = forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      Logo,
      ClosedLogo = DefaultClosedIcon,
      logoLink,
      items,
      footer,
      className,
      isExpandedAtDefault = true,
      onSideBarToggle,
      ...props
    },
    ref
  ) => {
    const [isSidebarOpen, setIsSidebarOpen] = useLocalStorageState(
      SIDEBAR_OPEN_KEY,
      {
        defaultValue: isExpandedAtDefault,
      }
    );

    // Make sure sidebar state in local storage match with cookie when page is loaded
    useEffect(() => {
      const sideBarStateFromCookie = getCookieItem(SIDEBAR_OPEN_KEY);
      const isSideBarOpen =
        sideBarStateFromCookie === 'true'
          ? true
          : sideBarStateFromCookie === 'false'
          ? false
          : isExpandedAtDefault;

      setIsSidebarOpen(isSideBarOpen);
    }, [setIsSidebarOpen]);

    return (
      <div
        className={cx('flex gap-2 top-0 left-0 z-50 relative', className)}
        {...props}
        ref={ref}
      >
        <div
          className={twMerge(
            'h-full flex flex-col justify-between py-6',
            'bg-mono-0 dark:bg-mono-180 transition-all duration-200 ease-in-out',
            isSidebarOpen ? 'w-72 px-4' : 'w-16 px-2'
          )}
        >
          <div>
            <div className={isSidebarOpen ? 'px-2' : ''}>
              <SideBarLogo
                logoLink={logoLink}
                Logo={!isSidebarOpen ? ClosedLogo : Logo}
                isExpanded={isSidebarOpen}
              />
            </div>

            <SideBarItems items={items} isExpanded={isSidebarOpen} />
          </div>

          <div
            className="flex-grow"
            onClick={() => {
              setIsSidebarOpen(!isSidebarOpen);
              onSideBarToggle && onSideBarToggle();
            }}
          />

          <SideBarFooter
            name={footer.name}
            Icon={footer.Icon}
            isInternal={footer.isInternal}
            href={footer.href}
            useNextThemesForThemeToggle={footer.useNextThemesForThemeToggle}
            isExpanded={isSidebarOpen}
            className={isSidebarOpen ? 'p-2' : 'pl-1'}
          />
        </div>
      </div>
    );
  }
);

const DefaultClosedIcon: FC<LogoProps> = ({ size: _, ...props }) => {
  return <WebbLogoIcon {...props} width={28} height={28} />;
};

export const SidebarTangleClosedIcon: FC<LogoProps> = ({
  size: _,
  ...props
}) => {
  return <TangleIcon {...props} width={32} height={28} />;
};
