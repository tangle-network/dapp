'use client';

import { RadioGroup, RadioItem } from '@radix-ui/react-dropdown-menu';
import {
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
  DropdownMenuItem,
} from '../Dropdown';
import { Typography } from '../../typography/Typography';
import { useCallback } from 'react';
import { AnimatedChevronRight } from '../BridgeInputs/AnimatedChevronRight';
import { twMerge } from 'tailwind-merge';
import { Label } from '../Label';

export type DropdownFieldProps = {
  title: string;
  items: string[];
  className?: string;
  selectedItem: string;
  setSelectedItem: (selectedItem: string) => void;
  dropdownBodyClassName?: string;
};

export const DropdownField = ({
  title,
  items,
  selectedItem,
  setSelectedItem,
  className,
  dropdownBodyClassName,
}: DropdownFieldProps) => {
  const handleValueChange = useCallback(
    (selectedItem: string) => {
      setSelectedItem(selectedItem);
    },
    [setSelectedItem],
  );

  return (
    <div
      className={twMerge(
        'px-2.5 lg:px-4 py-2 w-full min-h-[74px] rounded-lg',
        'bg-mono-20 dark:bg-mono-170',
        'outline outline-1 outline-offset-1 outline-transparent',
        className,
      )}
    >
      <Label>{title}</Label>

      <Dropdown className="block grow shrink basis-0">
        <DropdownBasicButton className="h-full group focus-visible:outline-none w-full inline-block">
          <div className="flex items-center gap-5 justify-between w-full">
            <Typography variant="h5" fw="bold" className="text-lg">
              {selectedItem}
            </Typography>

            <AnimatedChevronRight size="lg" />
          </div>
        </DropdownBasicButton>

        <DropdownBody
          className={twMerge(
            'max-w-[360px] !z-50 !bg-mono-0 dark:!bg-mono-170 !mt-6 !-mr-4',
            dropdownBodyClassName,
          )}
        >
          <RadioGroup
            className="border dark:border-mono-140 !rounded-lg"
            value={selectedItem}
            onValueChange={handleValueChange}
          >
            {items.map((item, i) => (
              <RadioItem key={i} value={item} asChild>
                <DropdownMenuItem className="dark:hover:!bg-mono-160">
                  <Typography
                    variant="body1"
                    className="text-mono-140 dark:text-mono-0"
                  >
                    {item}
                  </Typography>
                </DropdownMenuItem>
              </RadioItem>
            ))}
          </RadioGroup>
        </DropdownBody>
      </Dropdown>
    </div>
  );
};
