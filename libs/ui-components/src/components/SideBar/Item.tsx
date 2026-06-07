'use client';

import { ArrowRightUp, ChevronDown, ChevronUp } from '@tangle-network/icons';
import { FC, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { useClientReady } from '../../hooks/useClientReady';
import { Typography } from '../../typography/Typography';
import isSideBarItemActive from '../../utils/isSideBarItemActive';
import { Link } from '../Link';
import { SubItem } from './SubItem';
import WithInfo from './WithInfo';
import { SideBarExtraItemProps, SideBarItemProps } from './types';
import StyledItem from './StyledItem';
import useLinkProps from './useLinkProps';

const SideBarItem: FC<SideBarItemProps & SideBarExtraItemProps> = ({
  name,
  isInternal,
  href,
  Icon,
  subItems,
  isExpanded,
  isActive,
  setIsActive,
  isDisabled,
  pathnameOrHash,
  onClick,
  info,
}) => {
  const isMounted = useClientReady();
  const activeSubItemKey = useMemo(
    () => `${pathnameOrHash}:${subItems.map(({ href }) => href).join('|')}`,
    [pathnameOrHash, subItems],
  );
  const routeActiveSubItem = useMemo(
    () =>
      subItems.findIndex((subItem) =>
        isSideBarItemActive(subItem.href, pathnameOrHash),
      ),
    [pathnameOrHash, subItems],
  );
  const [activeSubItemOverride, setActiveSubItemOverride] = useState<{
    key: string;
    index: number;
  } | null>(null);
  const activeSubItem =
    activeSubItemOverride?.key === activeSubItemKey
      ? activeSubItemOverride.index
      : routeActiveSubItem;
  const [dropdownState, setDropdownState] = useState(() => ({
    isActive,
    isOpen: Boolean(isActive),
  }));
  const isDropdownOpen =
    dropdownState.isActive === isActive
      ? dropdownState.isOpen
      : Boolean(isActive);

  const openDropdown = (isOpen: boolean) => {
    setDropdownState({ isActive, isOpen });
  };

  const setSubItemActive = (index: number) => {
    setActiveSubItemOverride({ key: activeSubItemKey, index });
  };

  const setItemAsActiveAndToggleDropdown = () => {
    if (isDisabled) {
      return;
    }

    if (!isExpanded && setIsActive && isInternal) {
      setIsActive();
    }

    if (subItems.length > 0) {
      openDropdown(!isDropdownOpen);
    }
  };

  const linkProps = useLinkProps({
    href,
    isInternal,
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
          {/* NOTE: Make the link generic */}
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
              setSubItemIsActive={() => setSubItemActive(index)}
            />
          ))}
        </ul>
      )}
    </>
  );
};

export default SideBarItem;
