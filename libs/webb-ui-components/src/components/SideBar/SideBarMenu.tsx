import { FC, useState } from 'react';
import cx from 'classnames';
import * as Dialog from '@radix-ui/react-dialog';
import { HamburgerMenu, ExternalLinkLine } from '@webb-tools/icons';

import { Typography } from '../../typography/Typography';
import { SideBarItem } from './Item';
import { ThemeToggle } from '../ThemeToggle';
import { Link } from '../Link';
import { SidebarProps } from './types';

export const SideBarMenu: FC<SidebarProps> = ({
  Logo,
  logoLink,
  items,
  footer,
  className,
}) => {
  const [activeItem, setActiveItem] = useState<number | null>(0);

  return (
    <div className={cx('flex items-center', className)}>
      <Dialog.Root>
        <Dialog.Trigger>
          <HamburgerMenu size="lg" className="fill-mono-200 dark:fill-mono-0" />
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-[rgba(0,0,0,0.1)] animate-[showDialogOverlay_150ms]" />
          <Dialog.Content
            className={cx(
              'w-[280px] h-full overflow-auto py-6 px-4',
              '!bg-mono-0 dark:!bg-mono-160 fixed left-0',
              'animate-[sideBarSlideLeftToRight_400ms]',
              'flex flex-col justify-between'
            )}
          >
            <div>
              <a
                href={logoLink ? logoLink : '/'}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Logo size="md" />
              </a>

              <div className="mt-11 flex flex-col gap-4">
                {items.map((itemProps, index) => (
                  <SideBarItem
                    key={index}
                    {...itemProps}
                    isSidebarOpen={true}
                    isActive={activeItem === index}
                    setIsActive={() => setActiveItem(index)}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 p-2">
              <div className="group flex items-center justify-between">
                <Link href={footer.href} aTagProps={{ target: '_blank' }}>
                  <footer.Icon
                    width={24}
                    height={24}
                    className="cursor-pointer !fill-mono-100 dark:!fill-mono-60 group-hover:!fill-mono-200 dark:group-hover:!fill-mono-0"
                  />
                </Link>

                <div className="pl-2">
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
                  <div className="pl-[26px]">
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
              </div>

              <ThemeToggle />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};
