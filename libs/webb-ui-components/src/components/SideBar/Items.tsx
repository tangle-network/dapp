'use client';

import { useState, type FC, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import isSideBarItemActive from '../../utils/isSideBarItemActive';

import SideBarItem from './Item';
import { SideBarItemsProps } from './types';

export const SideBarItems: FC<SideBarItemsProps> = ({
  items,
  pathnameOrHash,
  isExpanded,
  className,
}) => {
  const [activeItem, setActiveItem] = useState<number>(() => {
    const activeItemIndex = items.findIndex((item) => {
      const isActive =
        item.subItems.length === 0
          ? isSideBarItemActive(item.href, pathnameOrHash)
          : isSideBarItemActive(
              item.subItems.map((i) => i.href),
              pathnameOrHash,
            );

      return isActive;
    });

    return activeItemIndex;
  });

  useEffect(() => {
    const idx = items.findIndex((item) => {
      const isActive =
        item.subItems.length === 0
          ? isSideBarItemActive(item.href, pathnameOrHash)
          : isSideBarItemActive(
              item.subItems.map((i) => i.href),
              pathnameOrHash,
            );

      return isActive;
    });

    setActiveItem(idx);
  }, [items, pathnameOrHash]);

  return (
    <div className={twMerge('flex flex-col mt-11 gap-4', className)}>
      {items.map((itemProps, idx) => {
        return (
          <SideBarItem
            key={idx}
            pathnameOrHash={pathnameOrHash}
            {...itemProps}
            isExpanded={isExpanded}
            isActive={activeItem === idx}
            setIsActive={() => setActiveItem(idx)}
          />
        );
      })}
    </div>
  );
};
