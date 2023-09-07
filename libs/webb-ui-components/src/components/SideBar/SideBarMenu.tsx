'use client';

import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import * as Dialog from '@radix-ui/react-dialog';
import { HamburgerMenu } from '@webb-tools/icons';

import { SideBarLogo, SideBarItems, SideBarFooter } from '.';
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
      ...props
    },
    ref
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
                '!bg-mono-0 dark:!bg-mono-160 fixed left-0',
                'animate-[sideBarSlideLeftToRight_400ms]',
                'flex flex-col justify-between',
                overrideContentProps?.className
              )}
            >
              <div>
                <SideBarLogo logoLink={logoLink} Logo={Logo} />
                <SideBarItems items={items} isExpanded />
              </div>

              <SideBarFooter
                name={footer.name}
                Icon={footer.Icon}
                isInternal={footer.isInternal}
                href={footer.href}
                isExpanded
                className="gap-2 p-2"
              />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    );
  }
);
