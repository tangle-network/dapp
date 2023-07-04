import React, { useMemo, useState } from 'react';
import { SidebarControl } from './components/SidebarControl';
import { Item, ItemProps } from './components/Item';
import { LogoProps } from '../Logo/types';
import { twMerge } from 'tailwind-merge';
import { ThemeToggle } from '../ThemeToggle';
import { IconBase } from '@webb-tools/icons/types';
import { Typography } from '../../typography/Typography';
import { ExternalLinkLine } from '@webb-tools/icons';
import { pushToExternalLink, pushToInternalLink } from './utils';

type FooterProps = {
  name: string;
  isInternal: boolean;
  href: string;
  Icon: (props: IconBase) => JSX.Element;
};

type SidebarProps = {
  Logo: React.FC<LogoProps>;
  ClosedLogo?: React.FC<LogoProps>;
  items: ItemProps[];
  footer: FooterProps;
};

export const SideBar: React.FC<SidebarProps> = ({
  Logo,
  ClosedLogo,
  items,
  footer,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState<number | null>(0);

  const pushToFooterLink = () => {
    if (footer.isInternal) {
      pushToInternalLink(footer.href);
    } else {
      pushToExternalLink(footer.href);
    }
  };

  return (
    <div className="flex gap-2 sticky top-0 left-0 z-50">
      <div
        className={twMerge(
          'h-screen flex flex-col justify-between py-[48px] px-[16px] bg-mono-0 dark:bg-mono-160 transition-all duration-200 ease-in-out',
          isSidebarOpen ? 'w-[280px]' : 'w-[64px]'
        )}
      >
        <div>
          <div className={isSidebarOpen ? 'px-[8px]' : ''}>
            {!isSidebarOpen && ClosedLogo ? <ClosedLogo /> : <Logo size="md" />}
          </div>

          <div className="mt-[44px] flex flex-col gap-[16px]">
            {items.map((itemProps, index) => (
              <Item
                {...itemProps}
                isSidebarOpen={isSidebarOpen}
                isActive={activeItem === index}
                setIsActive={() => setActiveItem(index)}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-evenly">
          <footer.Icon
            width={24}
            height={24}
            onClick={pushToFooterLink}
            className="cursor-pointer"
          />

          {isSidebarOpen && (
            <>
              <Typography
                variant="body1"
                className="cursor-pointer"
                onClick={pushToFooterLink}
              >
                {footer.name}
              </Typography>
              {!footer.isInternal ? (
                <ExternalLinkLine
                  className="cursor-pointer"
                  onClick={pushToFooterLink}
                  width={24}
                  height={24}
                />
              ) : (
                ''
              )}
              <ThemeToggle />
            </>
          )}
        </div>
      </div>

      <div className="pt-[48px] px-[12px]">
        <SidebarControl
          isSidebarOpen={isSidebarOpen}
          toggleSideBar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>
    </div>
  );
};
