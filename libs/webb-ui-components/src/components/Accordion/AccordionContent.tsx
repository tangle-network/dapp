import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { AccordionContentProps } from './types';

/**
 * The style wrapper around Radix Accordion Content, must use inside `<AccordionItem></AccordionItem>` tag
 */
export const AccordionContent = forwardRef<
  HTMLDivElement,
  AccordionContentProps
>(({ className, ...props }, ref) => {
  return (
    <AccordionPrimitive.Content
      {...props}
      className={twMerge('p-4', className)}
      ref={ref}
    />
  );
});
