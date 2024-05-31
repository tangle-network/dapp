'use client';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { forwardRef } from 'react';

import { AccordionButtonBaseProps } from './types';

/**
 * The wrapper around Radix Accordion Trigger, must use inside `<AccordionItem></AccordionItem>` tag
 */
const AccordionButtonBase = forwardRef<
  HTMLButtonElement,
  AccordionButtonBaseProps
>((props, ref) => {
  return (
    <AccordionPrimitive.Header asChild>
      <AccordionPrimitive.Trigger {...props} ref={ref} />
    </AccordionPrimitive.Header>
  );
});

export default AccordionButtonBase;
