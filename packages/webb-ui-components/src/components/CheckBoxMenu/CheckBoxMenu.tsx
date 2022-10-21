import { CheckBox } from '@webb-dapp/webb-ui-components';
import cx from 'classnames';
import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { CheckBoxMenuProps } from './types';

/**
 * The `CheckBoxMenu` component
 *
 * Props:
 *
 * - `icon`: The optional icon displayed after the text
 * - `label`: The label to be displayed could be string or JSX
 *
 * @example
 *
 * ```jsx
 *  <CheckBoxMenu icon={<Filter />} label={Filter}/>
 *  <CheckBoxMenu
 *    checkboxProps={{ isChecked: isChecked }}
 *    icon={<Filter />} label={<h3>Filter</Filter>} onChange={() =>{ }
 *  />
 * ```
 */
export const CheckBoxMenu = React.forwardRef<HTMLLabelElement, CheckBoxMenuProps>(
  ({ checkboxProps, children, className: clsxProp, icon, label, onChange, ...props }, ref) => {
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
    const inputProps = useMemo(() => checkboxProps ?? {}, [checkboxProps]);
    return (
      <label htmlFor={id} role={'listitem'} className={className} {...props} ref={ref}>
        <span className='text-inherit dark:text-inherit'>{icon}</span>
        <span className={'flex-grow px-2'}>{label}</span>
        <CheckBox id={id} onChange={onChange} {...inputProps} />
      </label>
    );
  }
);
