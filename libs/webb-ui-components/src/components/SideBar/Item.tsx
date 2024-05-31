'use client';

import { ChevronDown, ChevronUp, ExternalLinkLine } from '@webb-tools/icons';
import { FC, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { Typography } from '../../typography/Typography';
import isSideBarItemActive from '../../utils/isSideBarItemActive';
import { Link } from '../Link';
import { SubItem } from './SubItem';
import WithInfo from './WithInfo';
import { SideBarExtraItemProps, SideBarItemProps } from './types';
import useLinkProps from './useLinkProps';

const SideBarItem: FC<SideBarItemProps & SideBarExtraItemProps> = ({
  name,
  isInternal,
  href,
  Icon,
  subItems,
  isNext,
  isExpanded,
  isActive,
  setIsActive,
  isDisabled,
  pathnameOrHash,
  onClick,
  info,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(Boolean(isActive));
  const [activeSubItem, setActiveSubItem] = useState<number>(() => {
    const activeSubItemIndex = subItems.findIndex((subItem) =>
      isSideBarItemActive(subItem.href, pathnameOrHash),
    );

    return activeSubItemIndex;
  });

  useEffect(() => {
    const idx = subItems.findIndex((subItem) =>
      isSideBarItemActive(subItem.href, pathnameOrHash),
    );

    setActiveSubItem(idx);
  }, [pathnameOrHash, subItems]);

  // handle mounting to tackle `className` did not match between server and client
  useEffect(() => {
    setIsMounted(true);
  }, [setIsMounted]);

  useEffect(() => {
    if (isActive) {
      setIsDropdownOpen(true);
    }
  }, [isActive]);

  const setItemAsActiveAndToggleDropdown = () => {
    if (isDisabled) {
      return;
    }

    if (!isExpanded && setIsActive && isInternal) {
      setIsActive();
    }

    if (subItems.length > 0) {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const linkProps = useLinkProps({
    href,
    isInternal,
    isNext,
    isDisabled,
    hasSubItem: subItems.length > 0,
    onClick,
  });

  if (!isMounted) return null;

  return (
    <>
      <WithInfo info={info}>
        <div
          onClick={setItemAsActiveAndToggleDropdown}
          className={isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        >
          <Link {...linkProps}>
            <div
              className={twMerge(
                'group select-none rounded-full',
                isDisabled && 'pointer-events-none',
                !isExpanded ? 'px-3 py-2' : 'flex items-center',
                isActive && (subItems.length === 0 || !isExpanded)
                  ? 'text-mono-200 dark:text-mono-0'
                  : 'text-mono-100 dark:text-mono-100',
                isExpanded && 'hover:bg-mono-20 dark:hover:bg-mono-160',
                isExpanded ? 'justify-between px-4 py-3' : 'justify-center',
                isActive &&
                  (subItems.length === 0 || !isExpanded) &&
                  'bg-mono-20 dark:bg-mono-160',
              )}
            >
              <div
                className={twMerge(
                  'flex gap-4 !text-inherit',
                  !isExpanded && 'justify-center',
                )}
              >
                <Icon width={24} height={24} className="!fill-current" />

                {isExpanded && (
                  <Typography variant="body1" className="!text-inherit">
                    {name}
                  </Typography>
                )}
              </div>

              {isExpanded &&
                (!isInternal && href && subItems.length <= 0 ? (
                  <ExternalLinkLine className="hidden group-hover:block !fill-current" />
                ) : subItems.length > 0 ? (
                  isDropdownOpen ? (
                    <ChevronDown className="!fill-current" />
                  ) : (
                    <ChevronUp className="!fill-current" />
                  )
                ) : null)}
            </div>
          </Link>
        </div>
      </WithInfo>

      {isExpanded && isDropdownOpen && (
        <ul className="flex flex-col gap-1 empty:hidden">
          {subItems.map((subItemProps, index) => (
            <SubItem
              key={index}
              pathnameOrHash={pathnameOrHash}
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
