'use client';

import { ChevronDown, ChevronUp, ExternalLinkLine } from '@webb-tools/icons';
import { FC, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { Typography } from '../../typography/Typography';
import { Link } from '../Link';
import { SubItem } from './SubItem';
import { SideBarExtraItemProps, SideBarItemProps } from './types';

const SideBarItem: FC<SideBarItemProps & SideBarExtraItemProps> = ({
  name,
  isInternal,
  href,
  Icon,
  subItems,
  isExpanded,
  isActive,
  setIsActive,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeSubItem, setActiveSubItem] = useState<number | null>(null);

  // handle mounting to tackle `className` did not match between server and client
  useEffect(() => {
    setIsMounted(true);
  }, [setIsMounted]);

  useEffect(() => {
    if (isActive) {
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  }, [isActive]);

  const setItemAsActiveAndToggleDropdown = () => {
    if (!isExpanded && setIsActive && isInternal) {
      setIsActive();
    }

    if (subItems.length > 0) {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  if (!isMounted) return null;

  return (
    <>
      <div onClick={setItemAsActiveAndToggleDropdown}>
        <Link href={href} target="_blank">
          <div
            className={twMerge(
              'group cursor-pointer select-none rounded-full',
              !isExpanded ? 'px-3 py-2' : 'flex items-center',
              isActive && (subItems.length === 0 || !isExpanded)
                ? 'text-mono-200 dark:text-mono-0'
                : 'text-mono-100 dark:text-mono-100',
              isExpanded ? 'hover:bg-mono-20 dark:hover:bg-mono-160' : '',
              isExpanded ? 'justify-between px-1 py-3' : 'justify-center',
              isActive && (subItems.length === 0 || !isExpanded)
                ? 'bg-mono-20 dark:bg-mono-160'
                : ''
            )}
          >
            <div
              className={twMerge(
                'flex gap-4 !text-inherit',
                !isExpanded && 'justify-center'
              )}
            >
              <Icon width={24} height={24} className="!fill-current" />

              {isExpanded && (
                <Typography variant="body1" className="!text-inherit">
                  {name}
                </Typography>
              )}
            </div>

            {isExpanded && (
              <>
                {!isInternal && href && subItems.length <= 0 ? (
                  <ExternalLinkLine className="hidden group-hover:block !fill-current" />
                ) : subItems.length > 0 ? (
                  isDropdownOpen ? (
                    <ChevronDown className="!fill-current" />
                  ) : (
                    <ChevronUp className="!fill-current" />
                  )
                ) : null}
              </>
            )}
          </div>
        </Link>
      </div>

      {isExpanded && isDropdownOpen && (
        <ul className="flex flex-col gap-1">
          {subItems.map((subItemProps, index) => (
            <SubItem
              key={index}
              {...subItemProps}
              isActive={activeSubItem === index && isActive}
              setItemIsActive={setIsActive}
              setSubItemIsActive={() => setActiveSubItem(index)}
            />
          ))}
        </ul>
      )}
    </>
  );
};

export default SideBarItem;
