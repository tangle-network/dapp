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
      disabled = false,
      isActive = false,
      ...props
    },
    ref,
  ) => {
    const className = useMemo(() => {
      return twMerge(
        cx(
          'flex items-center px-4 py-2 text-base outline-none',
          disabled ? 'opacity-60' : 'cursor-pointer',
          { 'hover:bg-blue-0 dark:hover:bg-mono-170': !disabled },
          { 'focus:bg-blue-0 dark:focus:bg-mono-170': !disabled },
          { 'hover:text-mono-200 dark:hover:text-mono-0': !disabled },
          { 'focus:text-mono-200 dark:focus:text-mono-0': !disabled },
          { 'bg-blue-0 dark:bg-mono-170': isActive },
          { 'text-mono-200 dark:text-mono-0': isActive },
          'radix-state-checked:text-mono-200 dark:radix-state-checked:text-mono-0',
          'radix-state-active:text-mono-200 dark:radix-state-active:text-mono-0',
        ),
        textTransform,
        clsxProp,
      );
    }, [clsxProp, textTransform, disabled, isActive]);

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
