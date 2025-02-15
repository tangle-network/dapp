'use client';

import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import useFormField from './useFormField';
import { Typography } from '../../typography/Typography/Typography';

const FormDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <Typography
      component="p"
      variant="body2"
      ref={ref}
      id={formDescriptionId}
      className={twMerge('text-mono-120 dark:text-mono-100', className)}
      {...props}
    />
  );
});

FormDescription.displayName = 'FormDescription';

export default FormDescription;
