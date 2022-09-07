import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import cx from 'classnames';
import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { MenuItem } from '../MenuItem';
import { DropdownMenuProps } from './types';

/**
 * The `DropdownMenu` component
 *
 * - `size`: The `Dropdown` size
 * - `label`: The label to be display, if not provided, the `Dropdown` trigger will display the value property
 * - `icon`: The icon before the `Dropdown` label
 * - `menuOptions`: Options array to display
 * - `value`: Current selected value (default will get the first item in the option list)
 * - `onChange`: Callback function to update the value
 *
 * ```jsx
 *  <DropdownMenu className='mr-3' size='sm' label='Filter' icon={<Filter />} menuOptions={dropdownOptions} />
 *  <DropdownMenu
 *    label='Brand'
 *    menuOptions={dropdownOptions}
 *    value={value}
 *    onChange={(nextVal) => setValue(nextVal)}
 *  />
 * ```
 */
export const DropdownMenu = React.forwardRef<HTMLDivElement, DropdownMenuProps>((props, ref) => {
  const { className, icon: iconProp, label, menuOptions, onChange, size = 'md', value } = props;

  const icon = useMemo(() => {
    if (!iconProp) {
      return;
    }

    return React.cloneElement(iconProp, {
      ...iconProp.props,
      size: size === 'md' ? 'lg' : 'md',
      className: twMerge('fill-current dark:fill-current', iconProp.props['className']),
    });
  }, [iconProp, size]);

  // Calculate the display text on the trigger button
  const triggerText = useMemo(() => {
    if (value) {
      return value;
    }

    if (!label && !menuOptions.length) {
      throw new Error('DropdownMenu without label needs an option list to render');
    }

    if (!label && menuOptions.length > 0) {
      return menuOptions[0].value;
    }

    return label;
  }, [label, menuOptions, value]);

  return (
    <div className={twMerge('relative inline-block text-left', className)} ref={ref}>
      <DropdownMenuPrimitive.Root>
        <DropdownMenuPrimitive.Trigger asChild>
          <button
            className={cx(
              'form-select border rounded-lg',
              'transition-none transition-[border-radius]',
              'px-4 py-2',
              size === 'md' ? 'min-w-[176px]' : 'min-w-[96px]',
              'flex items-center',
              'bg-mono-0 dark:bg-mono-200',
              'border-mono-80 dark:border-mono-120',
              'text-mono-140 dark:text-mono-80',
              'hover:border-blue-40 dark:hover:border-blue-70',
              'radix-state-open:border-blue-40 dark:radix-state-open:border-blue-70',
              'radix-state-open:bg-blue-0 dark:radix-state-open:bg-blue-120',
              'radix-state-open:rounded-t-lg',
              'radix-state-open:rounded-b-none'
            )}
          >
            {icon && <span className='mr-1 text-inherit'>{icon}</span>}
            <span className={cx('text-inherit', size === 'md' ? 'body1' : 'font-bold body4')}>{triggerText}</span>
          </button>
        </DropdownMenuPrimitive.Trigger>

        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content
            align='center'
            className={cx(
              'radix-side-top:animate-slide-up radix-side-bottom:animate-slide-down',
              'min-w-[176px] shadow-md overflow-hidden webb-shadow-md',
              size === 'md' ? 'rounded-b-lg border border-t-0' : 'rounded-lg border',
              'border-blue-40 dark:border-blue-70',
              'bg-mono-0 dark:bg-mono-200'
            )}
          >
            <DropdownMenuPrimitive.RadioGroup value={value} onValueChange={onChange}>
              {menuOptions.map(({ icon, value }, i) => (
                <DropdownMenuPrimitive.RadioItem key={`${value}-${i}`} value={value} asChild>
                  <MenuItem icon={icon}>{value}</MenuItem>
                </DropdownMenuPrimitive.RadioItem>
              ))}
            </DropdownMenuPrimitive.RadioGroup>
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      </DropdownMenuPrimitive.Root>
    </div>
  );
});
