import React, { useEffect, useState } from 'react';
import { ItemProps, ExtraItemProps } from './types';
import { SubItem } from './SubItem';
import { ChevronDown, ChevronUp, ExternalLinkLine } from '@webb-tools/icons';
import { Typography } from '../../typography/Typography';
import { twMerge } from 'tailwind-merge';
import { Link } from '../Link';

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
  const [activeSubItem, setActiveSubItem] = useState<number | null>(0);

  useEffect(() => {
    if (isActive) {
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  }, [isActive]);

  const setItemAsActiveAndToggleDropdown = () => {
    if (!isSidebarOpen && setIsActive && isInternal) {
      setIsActive();
    }

    if (subItems.length > 0) {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  return (
    <>
      <div onClick={setItemAsActiveAndToggleDropdown}>
        <Link href={href} aTagProps={{ target: '_blank' }}>
          <div
            className={twMerge(
              'flex items-center cursor-pointer select-none',
              isSidebarOpen
                ? 'hover:bg-mono-20 dark:hover:bg-mono-170 hover:rounded-full'
                : '',
              isActive && isSidebarOpen
                ? 'bg-mono-20 dark:bg-mono-170 rounded-full'
                : '',
              isSidebarOpen ? 'justify-between px-2 py-3' : 'justify-center'
            )}
            // onClick={pushToLinkAndToggleDropdown}
          >
            <div className="flex gap-[16px]">
              <div
                className={
                  !isSidebarOpen
                    ? twMerge(
                        isActive
                          ? 'rounded-full bg-mono-20 dark:bg-mono-170 '
                          : '',
                        'p-3'
                      )
                    : ''
                }
              >
                <Icon
                  width={24}
                  height={24}
                  className={
                    isActive
                      ? '!fill-mono-200 dark:!fill-mono-0'
                      : '!fill-mono-100 dark:!fill-mono-60'
                  }
                />
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
                  <div>{isDropdownOpen ? <ChevronDown /> : <ChevronUp />}</div>
                ) : null}
              </div>
            )}
          </div>
        </Link>
      </div>

      {isSidebarOpen && isDropdownOpen && (
        <ul className="flex flex-col gap-7 pl-12 pr-5">
          {subItems.map((subItemProps, index) => (
            <SubItem
              key={index}
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
