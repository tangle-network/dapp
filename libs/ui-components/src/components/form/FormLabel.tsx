'use client';

import * as LabelPrimitive from '@radix-ui/react-label';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import useFormField from './useFormField';

const FormLabel = forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <LabelPrimitive.Root
      ref={ref}
      className={twMerge(
        'body2 font-semibold text-mono-200 dark:text-mono-100',
        error && 'text-red-70 dark:text-red-50',
        className,
      )}
      htmlFor={formItemId}
      {...props}
    />
  );
});

FormLabel.displayName = 'FormLabel';

export default FormLabel;
