'use client';

import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import * as Dialog from '@radix-ui/react-dialog';
import { HamburgerMenu } from '@webb-tools/icons';

import { SideBarLogo } from './Logo';
import { SideBarItems } from './Items';
import { SideBarFooter } from './Footer';
import { SidebarProps } from './types';

export const SideBarMenu = forwardRef<HTMLDivElement, SidebarProps>(
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
      actionButton,
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
            <Dialog.Overlay className="fixed inset-0 bg-[rgba(0,0,0,0.1)] animate-[showDialogOverlay_150ms]" />
            <Dialog.Content
              {...overrideContentProps}
              className={twMerge(
                'w-[280px] h-full outline-none overflow-auto py-6 px-4',
                'bg-mono-0 dark:bg-mono-180 fixed left-0 top-0',
                'animate-[sideBarSlideLeftToRight_400ms]',
                'flex flex-col justify-between',
                overrideContentProps?.className,
              )}
            >
              <Dialog.Title className="sr-only">Sidebar Menu</Dialog.Title>

              <Dialog.Description className="sr-only">
                Sidebar Menu
              </Dialog.Description>

              <div>
                <SideBarLogo logoLink={logoLink} Logo={Logo} isExpanded />
                <SideBarItems
                  actionButton={actionButton}
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
