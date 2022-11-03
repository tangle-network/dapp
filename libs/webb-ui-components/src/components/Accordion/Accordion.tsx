import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { forwardRef } from 'react';

import { AccordionProps } from './types';

/**
 * The wrapper around Radix Accordion Root, use for displaying collapsible content
 *
 * @example
 *
 * ```jsx
 *    <Accordion>
 *      <AccordionItem value='item1'>
 *        <AccordionButton>Click to expand</AccordionButton>
 *        <AccordionContent>Expanded section</AccordionContent>
 *      </AccordionItem>
 *    </Accordion>
 * ```
 */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  ({ darkMode, ...props }, ref) => {
    return <AccordionPrimitive.Root {...props} ref={ref} />;
  }
);
