'use client';

import { forwardRef, useId } from 'react';
import FormItemContext from './FormItemContext';
import { twMerge } from 'tailwind-merge';

const FormItem = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={twMerge('space-y-2', className)} {...props} />
    </FormItemContext.Provider>
  );
});

FormItem.displayName = 'FormItem';

export default FormItem;
