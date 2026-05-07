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
import { AnimatedChevronRight } from './AnimatedChevronRight';
import { twMerge } from 'tailwind-merge';
import { Label } from '../Label';

type ToString = { toString(): string };

type Props<Item extends ToString> = {
  title: string;
  items: Item[];
  className?: string;
  selectedItem: Item;
  setSelectedItemId: (selectedItemId: string) => void;
  dropdownBodyClassName?: string;
  getDisplayText?: (item: Item) => string;
  getId?: (item: Item) => string;
};

export const DropdownField = <Item extends ToString>({
  title,
  items,
  selectedItem,
  setSelectedItemId,
  className,
  dropdownBodyClassName,
  getId,
  getDisplayText,
}: Props<Item>) => {
  const handleValueChange = useCallback(
    (selectedItemId: string) => {
      setSelectedItemId(selectedItemId);
    },
    [setSelectedItemId],
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
            {getDisplayText?.(selectedItem) ?? selectedItem.toString()}
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
          value={getId?.(selectedItem) ?? selectedItem.toString()}
          onValueChange={handleValueChange}
        >
          {items.map((item, i) => (
            <RadioItem key={i} value={getId?.(item) ?? item.toString()} asChild>
              <DropdownMenuItem className="w-full dark:hover:!bg-mono-160">
                <Typography
                  variant="body1"
                  className="text-mono-140 dark:text-mono-0"
                >
                  {getDisplayText?.(item) ?? item.toString()}
                </Typography>
              </DropdownMenuItem>
            </RadioItem>
          ))}
        </RadioGroup>
      </DropdownBody>
    </Dropdown>
  );
};
