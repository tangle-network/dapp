import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { Dropdown, DropdownBody, DropdownButton } from '../Dropdown';
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
    <Dropdown className={className} ref={ref}>
      <DropdownButton label={triggerText} icon={icon} size={size} />

      <DropdownBody size={size}>
        <DropdownMenuPrimitive.RadioGroup value={value} onValueChange={onChange}>
          {menuOptions.map(({ icon, value }, i) => (
            <DropdownMenuPrimitive.RadioItem key={`${value}-${i}`} value={value} asChild>
              <MenuItem icon={icon}>{value}</MenuItem>
            </DropdownMenuPrimitive.RadioItem>
          ))}
        </DropdownMenuPrimitive.RadioGroup>
      </DropdownBody>
    </Dropdown>
  );
});
