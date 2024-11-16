'use client';

import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import * as Dialog from '@radix-ui/react-dialog';
import { HamburgerMenu } from '@webb-tools/icons';

import { SideBarLogo } from './Logo';
import { SideBarItems } from './SideBarItems';
import { SideBarFooter } from './Footer';
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
      ...props
    },
    ref,
  ) => {
    return (
      <div
        className={twMerge('flex items-center', className)}
        {...props}
        ref={ref}
      >
        <Dialog.Root>
          <Dialog.Trigger className="outline-none">
            <HamburgerMenu
              size="lg"
              className="fill-mono-200 dark:fill-mono-0"
            />
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/65 animate-[showDialogOverlay_150ms]" />

            <Dialog.Content
              {...overrideContentProps}
              className={twMerge(
                'w-[280px] h-full outline-none overflow-auto py-6 px-4',
                'bg-mono-0 dark:bg-mono-200 fixed left-0 top-0',
                'animate-[sideBarSlideLeftToRight_400ms]',
                'flex flex-col gap-6 justify-between',
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
