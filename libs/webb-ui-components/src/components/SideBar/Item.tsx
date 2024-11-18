'use client';

import { ArrowRightUp, ChevronDown, ChevronUp } from '@webb-tools/icons';
import { FC, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { Typography } from '../../typography/Typography';
import isSideBarItemActive from '../../utils/isSideBarItemActive';
import { Link } from '../Link';
import { SubItem } from './SubItem';
import WithInfo from './WithInfo';
import { SideBarExtraItemProps, SideBarItemProps } from './types';
import useLinkProps from './useLinkProps';
import StyledItem from './StyledItem';

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
            <StyledItem
              isActive={isActive}
              isDisabled={isDisabled}
              isExpanded={isExpanded}
              subItemsCount={subItems.length}
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
                  <ArrowRightUp
                    size="lg"
                    className="hidden fill-current group-hover:block dark:fill-current"
                  />
                ) : subItems.length > 0 ? (
                  isDropdownOpen ? (
                    <ChevronDown className="!fill-current" />
                  ) : (
                    <ChevronUp className="!fill-current" />
                  )
                ) : null)}
            </StyledItem>
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
