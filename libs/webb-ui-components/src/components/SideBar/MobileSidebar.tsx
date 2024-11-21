'use client';

import { forwardRef, Fragment, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import * as Dialog from '@radix-ui/react-dialog';
import { HamburgerMenu } from '@webb-tools/icons';
import { Transition, TransitionChild } from '@headlessui/react';

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
        <Dialog.Root onOpenChange={setIsOpen}>
          <Dialog.Trigger className="outline-none">
            <HamburgerMenu
              size="lg"
              className="fill-mono-200 dark:fill-mono-0"
            />
          </Dialog.Trigger>

          <Transition show={isOpen}>
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay
                forceMount
                className="fixed inset-0 z-20 bg-black/65 backdrop-blur-[1px]"
              />
            </TransitionChild>

            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="ease-in duration-100"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Content
                forceMount
                {...overrideContentProps}
                className={twMerge(
                  'w-[280px] h-[calc(100%-16px)] outline-none overflow-auto py-6 px-4 z-50 rounded-xl',
                  'bg-mono-0 dark:bg-mono-200 fixed left-2 top-2 bottom-2',
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
                    // Close the sidebar when an item is clicked.
                    onItemClick={() => setIsOpen(false)}
                  />
                </div>

                <SideBarFooter
                  name={footer.name}
                  Icon={footer.Icon}
                  isInternal={footer.isInternal}
                  href={footer.href}
                  useNextThemesForThemeToggle={
                    footer.useNextThemesForThemeToggle
                  }
                  isExpanded
                  className="gap-2 p-2"
                />
              </Dialog.Content>
            </TransitionChild>
          </Transition>
        </Dialog.Root>
      </div>
    );
  },
);
