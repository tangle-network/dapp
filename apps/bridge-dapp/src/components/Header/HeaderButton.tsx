import { PropsOf } from '@webb-tools/webb-ui-components/types';
import { forwardRef } from "react";
import { twMerge } from 'tailwind-merge';

export const HeaderButton = forwardRef<HTMLButtonElement, PropsOf<'button'>>(
  ({ className, ...props }, ref) => (
    <button
      {...props}
      className={twMerge(
        'flex items-center space-x-2 py-2 px-4',
        'border !border-mono-60 rounded-lg',
        className
      )}
      ref={ref}
    />
  )
);
