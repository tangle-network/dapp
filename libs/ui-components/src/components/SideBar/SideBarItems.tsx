'use client';

import { useMemo, useState, type FC } from 'react';
import { twMerge } from 'tailwind-merge';
import isSideBarItemActive from '../../utils/isSideBarItemActive';

import SideBarItem from './Item';
import { SideBarItemsProps } from './types';

export const SideBarItems: FC<SideBarItemsProps> = ({
  items,
  pathnameOrHash,
  isExpanded,
  className,
  ActionButton,
  onItemClick,
}) => {
  const activeItemKey = useMemo(
    () =>
      `${pathnameOrHash}:${items
        .map(
          (item) =>
            `${item.href}:${item.subItems.map((i) => i.href).join(',')}`,
        )
        .join('|')}`,
    [items, pathnameOrHash],
  );
  const routeActiveItem = useMemo(
    () =>
      items.findIndex((item) => {
        const isActive =
          item.subItems.length === 0
            ? isSideBarItemActive(item.href, pathnameOrHash)
            : isSideBarItemActive(
                item.subItems.map((i) => i.href),
                pathnameOrHash,
              );

        return isActive;
      }),
    [items, pathnameOrHash],
  );
  const [activeItemOverride, setActiveItemOverride] = useState<{
    key: string;
    index: number;
  } | null>(null);
  const activeItem =
    activeItemOverride?.key === activeItemKey
      ? activeItemOverride.index
      : routeActiveItem;

  const setItemActive = (index: number) => {
    setActiveItemOverride({ key: activeItemKey, index });
  };

  return (
    <div className={twMerge('flex flex-col gap-2', className)}>
      {ActionButton && <ActionButton isExpanded={isExpanded} />}

      {items.map((itemProps, idx) => {
        return (
          <SideBarItem
            key={idx}
            pathnameOrHash={pathnameOrHash}
            {...itemProps}
            isExpanded={isExpanded}
            isActive={activeItem === idx}
            setIsActive={() => setItemActive(idx)}
            onClick={onItemClick}
          />
        );
      })}
    </div>
  );
};
