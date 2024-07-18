'use client';

import React, { useMemo } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import cx from 'classnames';
import { twMerge } from 'tailwind-merge';

import { MenuItemProps } from './types';

/**
 * The dropdown `MenuItem` component (must be used inside the `Dropdown*` component)
 *
 * Props:
 *
 * - `icon`: The icon displayed after the text
 *
 * @example
 *
 * ```jsx
 *  <MenuItem icon={<Filter />}>Filter</MenuItem>
 *  <MenuItem>Item 1</MenuItem>
 * ```
 */
const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  (
    {
      children,
      className: clsxProp,
      startIcon,
      icon,
      textTransform = 'capitalize',
      ...props
    },
    ref,
  ) => {
    const className = useMemo(() => {
      return twMerge(
        cx(
          'flex cursor-pointer items-center px-4 py-2 text-base outline-none',
          'text-mono-140 dark:text-mono-80',
          'hover:bg-blue-0 dark:hover:bg-mono-180',
          'focus:bg-blue-0 dark:focus:bg-mono-180',
          'radix-state-checked:text-blue dark:radix-state-checked:text-blue-50',
          'radix-state-active:text-blue dark:radix-state-active:text-blue-50',
        ),
        textTransform,
        clsxProp,
      );
    }, [clsxProp, textTransform]);

    return (
      <DropdownMenu.Item className={className} {...props} ref={ref}>
        {startIcon && <div className="mr-2.5 shrink-0">{startIcon}</div>}
        <span className="flex-grow text-inherit dark:text-inherit">
          {children}
        </span>
        {icon && <div className="shrink-0">{icon}</div>}
      </DropdownMenu.Item>
    );
  },
);

export default MenuItem;
