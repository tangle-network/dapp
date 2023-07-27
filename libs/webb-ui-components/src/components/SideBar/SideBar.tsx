import React, { useState, forwardRef } from 'react';
import cx from 'classnames';
import useLocalStorageState from 'use-local-storage-state';
import { twMerge } from 'tailwind-merge';
import { ChevronLeft, ChevronRight, ExternalLinkLine } from '@webb-tools/icons';

import { Typography } from '../../typography/Typography';
import { Link } from '../Link';
import { ThemeToggle } from '../ThemeToggle';
import { SideBarItem } from './Item';
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
  ({ Logo, ClosedLogo, logoLink, items, footer, className, ...props }, ref) => {
    const [isSidebarOpen, setIsSidebarOpen] = useLocalStorageState(
      'isSidebarOpen',
      {
        defaultValue: true,
      }
    );

    const [activeItem, setActiveItem] = useState<number | null>(0);
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
            'h-screen flex flex-col justify-between py-12 px-4 bg-mono-0 dark:bg-mono-160 transition-all duration-200 ease-in-out',
            isSidebarOpen ? 'w-72' : 'w-16'
          )}
        >
          <div>
            <div className={isSidebarOpen ? 'px-2' : ''}>
              <a
                href={logoLink ? logoLink : '/'}
                target="_blank"
                rel="noopener noreferrer"
              >
                {!isSidebarOpen && ClosedLogo ? (
                  <ClosedLogo />
                ) : (
                  <Logo size="md" />
                )}
              </a>
            </div>

            <div className="flex flex-col gap-4 mt-11">
              {items.map((itemProps, index) => (
                <SideBarItem
                  key={index}
                  {...itemProps}
                  isSidebarOpen={isSidebarOpen}
                  isActive={activeItem === index}
                  setIsActive={() => setActiveItem(index)}
                />
              ))}
            </div>
          </div>

          <div
            className="flex-grow"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          <div
            className={twMerge(
              'flex items-center justify-between',
              isSidebarOpen ? 'p-2' : 'pl-1'
            )}
          >
            <div className="flex items-center justify-between group">
              <Link href={footer.href} aTagProps={{ target: '_blank' }}>
                <footer.Icon
                  width={24}
                  height={24}
                  className="cursor-pointer !fill-mono-100 dark:!fill-mono-60 group-hover:!fill-mono-200 dark:group-hover:!fill-mono-0"
                />
              </Link>

              {isSidebarOpen && (
                <>
                  <div className={isSidebarOpen ? 'pl-4' : ''}>
                    <Link href={footer.href} aTagProps={{ target: '_blank' }}>
                      <Typography
                        variant="body1"
                        className="cursor-pointer text-mono-100 dark:text-mono-60 group-hover:text-mono-200 dark:group-hover:text-mono-0"
                      >
                        {footer.name}
                      </Typography>
                    </Link>
                  </div>

                  {!footer.isInternal ? (
                    <div className={isSidebarOpen ? 'pl-[26px]' : ''}>
                      <Link href={footer.href} aTagProps={{ target: '_blank' }}>
                        <ExternalLinkLine
                          className="cursor-pointer !fill-mono-100 dark:!fill-mono-60 group-hover:!fill-mono-200 dark:group-hover:!fill-mono-0"
                          width={24}
                          height={24}
                        />
                      </Link>
                    </div>
                  ) : (
                    ''
                  )}
                </>
              )}
            </div>

            {isSidebarOpen && <ThemeToggle />}
          </div>
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
