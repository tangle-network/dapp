'use client';

import { DoubleArrowLeftIcon } from '@radix-ui/react-icons';
import { TangleIcon, WebbLogoIcon } from '@webb-tools/icons';
import cx from 'classnames';
import { type FC, forwardRef, useCallback, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import useLocalStorageState from 'use-local-storage-state';
import { SIDEBAR_OPEN_KEY } from '../../constants';
import getCookieItem from '../../utils/getCookieItem';
import IconButton from '../buttons/IconButton';
import { LogoProps } from '../Logo/types';
import { SideBarFooter } from './Footer';
import { SideBarItems } from './Items';
import { SideBarLogo } from './Logo';
import { SidebarProps } from './types';

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
      pathnameOrHash,
      ActionButton,
      ...props
    },
    ref,
  ) => {
    const [isSidebarOpen, setIsSidebarOpen] = useLocalStorageState(
      SIDEBAR_OPEN_KEY,
      {
        defaultValue: isExpandedAtDefault,
      },
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
    }, [isExpandedAtDefault, setIsSidebarOpen]);

    const handleToggleSidebar = useCallback(() => {
      setIsSidebarOpen(!isSidebarOpen);
      onSideBarToggle && onSideBarToggle();
    }, [isSidebarOpen, onSideBarToggle, setIsSidebarOpen]);

    return (
      <div
        className={cx('flex gap-2 top-0 left-0 z-50 relative', className)}
        {...props}
        ref={ref}
      >
        <div
          className={twMerge(
            'h-full flex flex-col justify-between py-6',
            'bg-mono-0 dark:bg-mono-200 transition-all duration-200 ease-in-out',
            isSidebarOpen ? 'w-72 px-4' : 'w-16 px-2',
          )}
        >
          <div>
            <div
              className={cx(
                'flex items-center',
                isSidebarOpen ? 'justify-between' : 'justify-center',
                isSidebarOpen && 'px-2',
              )}
            >
              <SideBarLogo
                logoLink={logoLink}
                Logo={!isSidebarOpen ? ClosedLogo : Logo}
                isExpanded={isSidebarOpen}
              />

              <IconButton
                onClick={handleToggleSidebar}
                className={cx(
                  'transition-[right] duration-300 ease-in-out',
                  !isSidebarOpen
                    ? 'absolute -right-[calc(50%_+_8px)]'
                    : 'right-full',
                )}
              >
                <DoubleArrowLeftIcon
                  className={cx(
                    'transition-transform duration-300 ease-in-out',
                    isSidebarOpen ? 'rotate-0' : 'rotate-180',
                  )}
                />
              </IconButton>
            </div>

            <SideBarItems
              ActionButton={ActionButton}
              pathnameOrHash={pathnameOrHash}
              items={items.filter((item) => item.isInternal)}
              isExpanded={isSidebarOpen}
            />
          </div>

          <div className="space-y-2">
            <SideBarItems
              pathnameOrHash={pathnameOrHash}
              items={items.filter((item) => !item.isInternal)}
              isExpanded={isSidebarOpen}
              className="gap-2"
            />

            <SideBarFooter
              name={footer.name}
              Icon={footer.Icon}
              isInternal={footer.isInternal}
              href={footer.href}
              useNextThemesForThemeToggle={footer.useNextThemesForThemeToggle}
              isExpanded={isSidebarOpen}
              className={isSidebarOpen ? 'p-2' : ''}
            />
          </div>
        </div>
      </div>
    );
  },
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
