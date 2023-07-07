import React, { useState } from 'react';
import { SidebarProps } from './types';
import { Item } from './Item';
import { twMerge } from 'tailwind-merge';
import { ThemeToggle } from '../ThemeToggle';
import { Typography } from '../../typography/Typography';
import {
  ChainIcon,
  ChevronLeft,
  ChevronRight,
  ExternalLinkLine,
} from '@webb-tools/icons';
import { Link } from '../Link';

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
export const SideBar: React.FC<SidebarProps> = ({
  Logo,
  ClosedLogo,
  logoLink,
  items,
  footer,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState<number | null>(0);

  return (
    <div className="flex gap-2 sticky top-0 left-0 z-50">
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

          <div className="mt-11 flex flex-col gap-4">
            {items.map((itemProps, index) => (
              <Item
                key={index}
                {...itemProps}
                isSidebarOpen={isSidebarOpen}
                isActive={activeItem === index}
                setIsActive={() => setActiveItem(index)}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-evenly">
          <Link href={footer.href} aTagProps={{ target: '_blank' }}>
            <footer.Icon width={24} height={24} className="cursor-pointer" />
          </Link>

          {isSidebarOpen && (
            <>
              <Link href={footer.href} aTagProps={{ target: '_blank' }}>
                <Typography variant="body1" className="cursor-pointer">
                  {footer.name}
                </Typography>
              </Link>

              {!footer.isInternal ? (
                <Link href={footer.href} aTagProps={{ target: '_blank' }}>
                  <ExternalLinkLine
                    className="cursor-pointer"
                    width={24}
                    height={24}
                  />
                </Link>
              ) : (
                ''
              )}
              <ThemeToggle />
            </>
          )}
        </div>
      </div>

      <div className="pt-12 px-3">
        <div
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="bg-mono-0 dark:bg-mono-180 rounded-full p-1 cursor-pointer shadow-lg"
        >
          {isSidebarOpen ? (
            <ChevronLeft size="lg" />
          ) : (
            <ChevronRight size="lg" />
          )}
        </div>
      </div>
    </div>
  );
};
