'use client';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from '@tangle-network/icons';
import { Typography } from '../../typography';
import cx from 'classnames';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { AccordionButtonProps } from './types';

/**
 * The style wrapper around Radix Accordion Trigger, must use inside `<AccordionItem></AccordionItem>` tag
 */
export const AccordionButton = forwardRef<
  HTMLButtonElement,
  AccordionButtonProps
>(({ children, className, Icon, RightIcon, ...props }, ref) => {
  return (
    <AccordionPrimitive.Trigger
      {...props}
      className={twMerge(
        cx(
          'group flex w-full select-none items-center justify-between px-4 py-2',
        ),
        className,
      )}
      ref={ref}
    >
      <p className="flex items-center gap-2">
        {Icon}

        <Typography
          variant="body1"
          component="span"
          fw="bold"
          className="block"
        >
          {children}
        </Typography>
      </p>

      <p className="flex items-center gap-2">
        {RightIcon}

        <ChevronDown className="block duration-300 ease-in-out transform group-radix-state-open:rotate-180" />
      </p>
    </AccordionPrimitive.Trigger>
  );
});
