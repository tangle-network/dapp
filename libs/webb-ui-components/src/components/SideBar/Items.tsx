import { type FC, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import isSideBarItemActive from '../../utils/isSideBarItemActive';

import SideBarItem from './Item';
import { SideBarItemsProps } from './types';

export const SideBarItems: FC<SideBarItemsProps> = ({
  items,
  isExpanded,
  className,
}) => {
  const [activeItem, setActiveItem] = useState<number | null>(null);

  return (
    <div
      className={twMerge(
        'flex flex-col mt-11',
        isExpanded ? 'gap-1' : 'gap-4',
        className
      )}
    >
      {items.map((itemProps, idx) => {
        const itemHrefActive =
          itemProps.subItems.length === 0
            ? isSideBarItemActive(itemProps.href)
            : isSideBarItemActive(itemProps.subItems.map((i) => i.href));

        return (
          <SideBarItem
            key={idx}
            {...itemProps}
            isExpanded={isExpanded}
            isActive={itemHrefActive || activeItem === idx}
            setIsActive={() => setActiveItem(idx)}
          />
        );
      })}
    </div>
  );
};
