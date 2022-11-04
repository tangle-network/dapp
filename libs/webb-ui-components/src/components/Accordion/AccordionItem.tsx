import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { AccordionContentProps, AccordionItemProps } from './types';

/**
 * The style wrapper around Radix Accordion, must use inside `<Accordion></Accordion>` tag
 */
export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, ...props }, ref) => {
    return (
      <AccordionPrimitive.Item
        {...props}
        className={twMerge('p-4', className)}
        ref={ref}
      />
    );
  }
);
