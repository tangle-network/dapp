import { CheckBoxMenu } from '@webb-dapp/webb-ui-components/components/CheckBoxMenu/CheckBoxMenu';
import { useMemo } from 'react';

export type CheckBoxMenuGroupProps<T> = {
  value: T[] | 'all';
  options: T[];
  onChange: (value: T[] | 'all') => void;
  iconGetter?(value: T): JSX.Element;
  labelGetter(value: T): JSX.Element | string;
  keyGetter(value: T): string;
};
/**
 * React component for building toggleable checkbox menu
 *
 * iconGetter - Getter function for the icon
 * keyGetter - Getter for list key
 * labelGetter - Label for the menu item
 * onChange - Change handler for the menu group
 * options - Full list of options available
 * value - selected value
 *
 * */
export function CheckBoxMenuGroup<T>({
  iconGetter,
  keyGetter,
  labelGetter,
  onChange,
  options,
  value,
}: CheckBoxMenuGroupProps<T>) {
  const isAllSelected = useMemo(() => value === 'all' || value.length === options.length, [value, options]);
  return (
    <>
      <CheckBoxMenu
        checkboxProps={{
          isChecked: isAllSelected,
        }}
        label={'all'}
        onChange={() => {
          onChange(isAllSelected ? [] : 'all');
        }}
      />

      {options.map((opt) => (
        <CheckBoxMenu
          onChange={() => {
            const isSelected = isAllSelected || (value as T[]).indexOf(opt) > -1;
            if (isAllSelected) {
              onChange(options.filter((o) => o !== opt));
            } else if (Array.isArray(value)) {
              if (isSelected) {
                onChange(value.filter((o) => o !== opt));
              } else {
                onChange([...value, opt]);
              }
            }
          }}
          checkboxProps={{
            isChecked: isAllSelected || (value as T[]).indexOf(opt) > -1,
          }}
          icon={iconGetter?.(opt) ?? undefined}
          key={keyGetter(opt)}
          label={labelGetter(opt)}
        />
      ))}
    </>
  );
}
