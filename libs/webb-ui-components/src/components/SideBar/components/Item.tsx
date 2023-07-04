import React, { useEffect, useMemo, useState } from 'react';
import { DropdownControl } from './DropdownControl';
import { SubItem, SubItemProps } from './SubItem';
import { ExternalLinkLine } from '@webb-tools/icons';
import { pushToInternalLink, pushToExternalLink } from '../utils';
import { IconBase } from '@webb-tools/icons/types';
import { Typography } from '../../../typography/Typography';
import { twMerge } from 'tailwind-merge';

export type ItemProps = {
  name: string;
  isInternal: boolean;
  href: string;
  Icon: (props: IconBase) => JSX.Element;
  subItems: SubItemProps[];
};

export type ExtraItemProps = {
  isSidebarOpen?: boolean;
  isActive?: boolean;
  setIsActive?: () => void;
};

export const Item: React.FC<ItemProps & ExtraItemProps> = ({
  name,
  isInternal,
  href,
  Icon,
  subItems,
  isSidebarOpen,
  isActive,
  setIsActive,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeSubItem, setActiveSubItem] = useState<number | null>(null);

  useEffect(() => {
    if (isActive) {
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  }, [isActive]);

  const pushToLinkAndToggleDropdown = () => {
    if (!isSidebarOpen && setIsActive && isInternal) {
      setIsActive();
    }

    if (!isSidebarOpen && isInternal && href) {
      pushToInternalLink(href);
    } else if (!isInternal && href) {
      pushToExternalLink(href);
    }

    if (subItems.length > 0) {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  return (
    <>
      <div
        className={twMerge(
          'flex items-center cursor-pointer select-none',
          isSidebarOpen
            ? 'hover:bg-mono-20 dark:hover:bg-mono-170 hover:rounded-full'
            : '',
          isActive && isSidebarOpen
            ? 'bg-mono-20 dark:bg-mono-170 rounded-full'
            : '',
          isSidebarOpen
            ? 'justify-between px-[8px] py-[12px]'
            : 'justify-center'
        )}
        onClick={pushToLinkAndToggleDropdown}
      >
        <div className="flex gap-[16px]">
          <div
            className={
              !isSidebarOpen
                ? twMerge(
                    isActive ? 'rounded-full bg-mono-20 dark:bg-mono-170 ' : '',
                    'p-[12px]'
                  )
                : ''
            }
          >
            <Icon width={24} height={24} />
          </div>

          {isSidebarOpen && (
            <Typography
              variant="body1"
              className={twMerge(
                'text-mono-100 dark:text-mono-60',
                isActive ? 'text-mono-200 dark:text-mono-0' : ''
              )}
            >
              {name}
            </Typography>
          )}
        </div>

        {isSidebarOpen && (
          <div>
            {!isInternal && href && subItems.length <= 0 ? (
              <ExternalLinkLine />
            ) : subItems.length > 0 ? (
              <DropdownControl isDropdownOpen={isDropdownOpen} />
            ) : null}
          </div>
        )}
      </div>

      {isSidebarOpen && isDropdownOpen && (
        <ul className="flex flex-col gap-[28px] pl-[48px] pr-[20px]">
          {subItems.map((subItemProps, index) => (
            <SubItem
              {...subItemProps}
              isActive={activeSubItem === index && isActive ? true : false}
              setItemIsActive={setIsActive}
              setSubItemIsActive={() => setActiveSubItem(index)}
            />
          ))}
        </ul>
      )}
    </>
  );
};
