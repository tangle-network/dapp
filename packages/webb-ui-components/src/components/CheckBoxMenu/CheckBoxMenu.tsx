import cx from 'classnames';
import React, { useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { CheckBoxMenuProps } from './types';
import { CheckBox } from '@webb-dapp/webb-ui-components';

/**
 * The `MenuItem` component
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
export const CheckBoxMenu = React.forwardRef<HTMLDivElement, CheckBoxMenuProps>(
  ({ onChange, label, children, className: clsxProp, icon, ...props }, ref) => {
    const className = useMemo(() => {
      return twMerge(
        cx(
          'flex cursor-pointer items-center px-4 py-2 text-base outline-none capitalize',
          'text-mono-140 dark:text-mono-80',
          'hover:bg-blue-0 dark:hover:bg-blue-120',
          'radix-state-checked:text-blue dark:radix-state-checked:text-blue-50',
          'radix-state-active:text-blue dark:radix-state-active:text-blue-50'
        ),
        clsxProp
      );
    }, [clsxProp]);
    const id = useMemo(() => Math.random().toString(16), []);
    return (
      <label htmlFor={id} role={'listitem'} className={className} {...props} ref={ref}>
        <span className='flex-grow text-inherit dark:text-inherit'>{icon}</span>
        {label}
        <CheckBox id={id} onChange={onChange} />
      </label>
    );
  }
);
