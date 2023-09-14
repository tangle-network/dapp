import { FC, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { ChevronDown, ChevronUp, ExternalLinkLine } from '@webb-tools/icons';

import { Typography } from '../../typography/Typography';
import {
  SideBarItemsProps,
  SideBarItemProps,
  SideBarExtraItemProps,
} from './types';
import { SubItem } from './SubItem';
import { Link } from '../Link';

export const SideBarItems: FC<SideBarItemsProps> = ({
  items,
  isExpanded,
  className,
}) => {
  const [activeItem, setActiveItem] = useState<number | null>(0);

  return (
    <div
      className={twMerge(
        'flex flex-col mt-11',
        isExpanded ? 'gap-1' : 'gap-4',
        className
      )}
    >
      {items.map((itemProps, idx) => (
        <SideBarItem
          key={idx}
          {...itemProps}
          isExpanded={isExpanded}
          isActive={activeItem === idx}
          setIsActive={() => setActiveItem(idx)}
        />
      ))}
    </div>
  );
};

export const SideBarItem: FC<SideBarItemProps & SideBarExtraItemProps> = ({
  name,
  isInternal,
  href,
  Icon,
  subItems,
  isExpanded,
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
    if (!isExpanded && setIsActive && isInternal) {
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
              'cursor-pointer select-none rounded-full',
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
                  <ExternalLinkLine className="!fill-current" />
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
