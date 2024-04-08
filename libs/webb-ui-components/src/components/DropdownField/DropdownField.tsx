import { RadioGroup, RadioItem } from '@radix-ui/react-dropdown-menu';
import { Dropdown, DropdownBasicButton, DropdownBody } from '../Dropdown';
import { MenuItem } from '../MenuItem';
import { Typography } from '../../typography/Typography';
import { useCallback } from 'react';
import { DropdownFieldProps } from './types';
import { AnimatedChevronRight } from '../BridgeInputs/AnimatedChevronRight';
import { twMerge } from 'tailwind-merge';

const DropdownField = ({
  title,
  items,
  selectedItem,
  setSelectedItem,
  className,
}: DropdownFieldProps) => {
  const handleValueChange = useCallback(
    (selectedItem: string) => {
      setSelectedItem(selectedItem);
    },
    [setSelectedItem]
  );

  return (
    <div
      className={twMerge(
        'px-4 py-2 w-full h-[74px] rounded-lg',
        'bg-mono-20 dark:bg-mono-160',
        'outline outline-1 outline-offset-1 outline-transparent',
        className
      )}
    >
      <Typography
        variant="body1"
        fw="bold"
        className="text-mono-100 dark:text-mono-100 leading-4 tracking-[1%]"
      >
        {title}
      </Typography>

      <Dropdown className="block grow shrink basis-0">
        <DropdownBasicButton
          className="h-full group focus-visible:outline-none"
          isFullWidth
        >
          <div className="flex items-center gap-5 justify-between w-full">
            <Typography
              variant="h5"
              fw="bold"
              className="!overflow-hidden whitespace-nowrap"
            >
              {selectedItem}
            </Typography>

            <AnimatedChevronRight size="lg" />
          </div>
        </DropdownBasicButton>

        <DropdownBody className="w-[368px] !z-50 !bg-mono-0 dark:!bg-mono-160 !border-none !mt-4 !-mr-4">
          <RadioGroup value={selectedItem} onValueChange={handleValueChange}>
            {items.map((item, i) => (
              <RadioItem key={`${item}-${i}`} value={item} asChild>
                <MenuItem
                  className={twMerge(
                    selectedItem === item
                      ? 'bg-blue-10 hover:!bg-blue-10 dark:bg-blue-120 hover:dark:!bg-blue-120'
                      : '',
                    'hover:!bg-inherit'
                  )}
                >
                  <Typography
                    variant="h5"
                    fw="bold"
                    className="leading-4 tracking-[1%] text-mono-140 dark:text-mono-0"
                  >
                    {item}
                  </Typography>
                </MenuItem>
              </RadioItem>
            ))}
          </RadioGroup>
        </DropdownBody>
      </Dropdown>
    </div>
  );
};

export default DropdownField;
