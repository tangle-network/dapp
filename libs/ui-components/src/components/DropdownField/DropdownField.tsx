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
    <Dropdown className="block grow shrink basis-0">
      <DropdownBasicButton
        type="button"
        className={twMerge(
          'group w-full min-h-[74px] rounded-lg px-2.5 lg:px-4 py-2',
          'flex flex-col items-start justify-center gap-1 text-left',
          'bg-mono-20 dark:bg-mono-170',
          'outline outline-1 outline-offset-1 outline-transparent',
          'transition-colors',
          'hover:bg-mono-40 dark:hover:bg-mono-160',
          'hover:outline-mono-40 dark:hover:outline-mono-140',
          'focus-visible:outline-mono-80 dark:focus-visible:outline-mono-140',
          className,
        )}
      >
        <Label>{title}</Label>

        <div className="flex items-center gap-5 justify-between w-full">
          <Typography variant="h5" fw="bold" className="text-lg">
            {selectedItem}
          </Typography>

          <AnimatedChevronRight size="lg" />
        </div>
      </DropdownBasicButton>

      <DropdownBody
        className={twMerge(
          'w-[var(--radix-dropdown-menu-trigger-width)] min-w-[var(--radix-dropdown-menu-trigger-width)] max-w-none',
          '!z-50 !bg-mono-0 dark:!bg-mono-170 !mt-2',
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
              <DropdownMenuItem className="w-full dark:hover:!bg-mono-160">
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
  );
};
