'use client';

import { ChevronLeft, ChevronRight, WebbLogoIcon } from '@webb-tools/icons';
import cx from 'classnames';
import { FC, forwardRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import useLocalStorageState from 'use-local-storage-state';
import { SideBarFooter, SideBarItems, SideBarLogo } from '.';
import { LogoProps } from '../Logo/types';
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
      ClosedLogo = DefaulClosedIcon,
      logoLink,
      items,
      footer,
      className,
      ...props
    },
    ref
  ) => {
    const [isSidebarOpen, setIsSidebarOpen] = useLocalStorageState(
      'isSidebarOpen',
      {
        defaultValue: true,
      }
    );

    const [isHovering, setIsHovering] = useState(false);

    return (
      <div
        className={cx('flex gap-2 top-0 left-0 z-50 relative', className)}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        {...props}
        ref={ref}
      >
        <div
          className={twMerge(
            'h-full flex flex-col justify-between py-12',
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
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
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

        {isHovering && (
          <div
            className="absolute top-0 right-0 px-3 pt-12"
            style={{ transform: 'translateX(100%)' }}
          >
            <div
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 rounded-full shadow-lg cursor-pointer bg-mono-0 dark:bg-mono-180"
            >
              {isSidebarOpen ? (
                <ChevronLeft size="md" />
              ) : (
                <ChevronRight size="md" />
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

const DefaulClosedIcon: FC<LogoProps> = ({ size: _, ...props }) => {
  return <WebbLogoIcon {...props} width={28} height={28} />;
};
