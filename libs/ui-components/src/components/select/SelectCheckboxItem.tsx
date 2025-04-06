import * as SelectPrimitive from '@radix-ui/react-select';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';
import type { CheckBoxProps } from '../CheckBox/types';
import { CheckBox } from '../CheckBox';

const SelectCheckboxItem: FC<CheckBoxProps> = ({
  children,
  ...checkboxProps
}) => {
  return (
    <div
      className={twMerge(
        'relative flex gap-2 w-full cursor-default select-none items-center',
        'rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none',
        'focus:bg-purple-40 dark:focus:bg-mono-170',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      )}
    >
      <CheckBox
        wrapperClassName="w-full flex items-center gap-2"
        {...checkboxProps}
      >
        {children}
      </CheckBox>
    </div>
  );
};

SelectCheckboxItem.displayName = SelectPrimitive.Item.displayName;

export default SelectCheckboxItem;
