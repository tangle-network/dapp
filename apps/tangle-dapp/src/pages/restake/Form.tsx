import { type ComponentProps, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

const Form = forwardRef<HTMLFormElement, ComponentProps<'form'>>(
  ({ className, ...props }, ref) => {
    return (
      <form
        {...props}
        className={twMerge('overflow-hidden', className)}
        ref={ref}
      />
    );
  },
);

Form.displayName = 'Form';

export default Form;
