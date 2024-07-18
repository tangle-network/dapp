'use client';

import React, { useMemo } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import cx from 'classnames';
import { twMerge } from 'tailwind-merge';

import { DropdownMenuItemProps } from './types';

/**
 * The DropdownMenuItem component (must be used inside the `Dropdown*` component)
 *
 * Props:
 *
 * - `rightIcon`: The icon displayed after the text
 * - `leftIcon`: The icon displayed before the text
 * - `textTransform`: The text transform style
 *
 * @example
 *
 * ```jsx
 *  <DropdownMenuItem rightIcon={<Filter />}>Filter</DropdownMenuItem>
 *  <DropdownMenuItem>Item 1</DropdownMenuItem>
 * ```
 */
const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  DropdownMenuItemProps
>(
  (
    {
      children,
      className: clsxProp,
      leftIcon,
      rightIcon,
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
        {leftIcon && <div className="mr-2.5 shrink-0">{leftIcon}</div>}
        <span className="flex-grow text-inherit dark:text-inherit">
          {children}
        </span>
        {rightIcon && <div className="shrink-0">{rightIcon}</div>}
      </DropdownMenu.Item>
    );
  },
);

export default DropdownMenuItem;
