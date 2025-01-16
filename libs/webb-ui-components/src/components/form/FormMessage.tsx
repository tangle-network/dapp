'use client';

import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../../typography/Typography/Typography';
import useFormField from './useFormField';

const FormMessage = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <Typography
      component="p"
      variant="body2"
      ref={ref}
      id={formMessageId}
      className={twMerge('text-red-70 dark:text-red-50', className)}
      {...props}
    >
      {body}
    </Typography>
  );
});

FormMessage.displayName = 'FormMessage';

export default FormMessage;
