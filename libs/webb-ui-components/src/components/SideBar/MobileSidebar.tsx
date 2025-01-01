'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { HamburgerMenu } from '@webb-tools/icons';
import { forwardRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { SideBarFooter } from './Footer';
import { SideBarLogo } from './Logo';
import { SideBarItems } from './SideBarItems';
import { MobileSidebarProps } from './types';

export const MobileSidebar = forwardRef<HTMLDivElement, MobileSidebarProps>(
  (
    {
      Logo,
      ClosedLogo,
      logoLink,
      items,
      footer,
      className,
      overrideContentProps,
      pathnameOrHash,
      ActionButton,
      onSideBarToggle,
      isExpandedByDefault,
      isExpanded,
      ...props
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(
      isExpandedByDefault ?? isExpanded ?? false,
    );

    return (
      <div
        className={twMerge('flex items-center', className)}
        {...props}
        ref={ref}
      >
        <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
          <Dialog.Trigger className="outline-none">
            <HamburgerMenu
              size="lg"
              className="fill-mono-200 dark:fill-mono-0"
            />
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay
              forceMount
              className={twMerge(
                'fixed inset-0 z-20 bg-black/65 backdrop-blur-[1px]',
                'animate-in duration-200 fade-in-0',
                'data-[state=open]:ease-out data-[state=closed]:ease-in',
              )}
            />

            <Dialog.Content
              forceMount
              {...overrideContentProps}
              className={twMerge(
                'w-[280px] h-[calc(100%-16px)] outline-none overflow-auto py-6 px-4 z-50 rounded-xl',
                'bg-mono-0 dark:bg-mono-200 fixed left-2 top-2 bottom-2',
                'flex flex-col gap-6 justify-between',
                'data-[state=open]:animate-in data-[state=open]:ease-out data-[state=open]:duration-200',
                'data-[state=open]:slide-in-from-left-full',
                'data-[state=closed]:animate-out data-[state=closed]:ease-in data-[state=closed]:duration-100',
                'data-[state=closed]:slide-out-to-left-full',
                overrideContentProps?.className,
              )}
            >
              <Dialog.Title className="sr-only">Sidebar Menu</Dialog.Title>

              <Dialog.Description className="sr-only">
                Sidebar Menu
              </Dialog.Description>

              <div className="space-y-6">
                <SideBarLogo
                  logoLink={logoLink}
                  Logo={Logo}
                  isExpanded
                  className="block px-3"
                />

                <SideBarItems
                  ActionButton={ActionButton}
                  items={items}
                  isExpanded
                  pathnameOrHash={pathnameOrHash}
                  // Close the sidebar when an item is clicked.
                  onItemClick={() => setIsOpen(false)}
                />
              </div>

              <SideBarFooter
                name={footer.name}
                Icon={footer.Icon}
                isInternal={footer.isInternal}
                href={footer.href}
                useNextThemesForThemeToggle={footer.useNextThemesForThemeToggle}
                isExpanded
                className="gap-2 p-2"
              />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    );
  },
);
