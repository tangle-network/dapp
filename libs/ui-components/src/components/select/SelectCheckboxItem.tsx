import * as SelectPrimitive from '@radix-ui/react-select';
import { FC, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Label } from '../Label';
import { Input, InputProps } from '../Input';

const SelectCheckboxItem: FC<{
  label?: React.ReactNode
} & InputProps> = ({
  label,
  ...inputProps
}) => {
  const [selected, setSelected] = useState<string[]>([]);

  const onChange = (value: string) => {
    setSelected(prev => [...prev, value]);
    inputProps.onChange?.(value);
  }

  return (
    <div
      className={twMerge(
        'relative flex gap-2 w-full cursor-default select-none items-center',
        'rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none',
        'focus:bg-purple-40 dark:focus:bg-mono-170',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      )}
    >
      <Input 
        type="checkbox" 
        {...inputProps} 
        checked={selected.includes(inputProps.value || '')}
        onChange={onChange}
        inputClassName={twMerge(
          'w-4 h-4 rounded-sm !p-0 !border-mono-80 dark:!border-mono-120',
          inputProps.className
        )}
      />
      <Label className='w-full' htmlFor={inputProps.id}>{label}</Label>
    </div>
  );
};

SelectCheckboxItem.displayName = SelectPrimitive.Item.displayName;

export default SelectCheckboxItem;
