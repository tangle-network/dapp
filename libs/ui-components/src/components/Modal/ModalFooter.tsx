import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { PropsOf } from '../../types';
import useIsBreakpoint from '../../hooks/useIsBreakpoint';

export const ModalFooter = forwardRef<HTMLDivElement, PropsOf<'div'>>(
  ({ className, ...props }, ref) => {
    const isMobile = useIsBreakpoint('sm', true);

    return (
      <div
        {...props}
        className={twMerge(
          'px-8 py-6 border-t border-mono-60 dark:border-mono-140 flex items-center gap-2',
          isMobile && 'flex-wrap px-3 py-3',
          className,
        )}
        ref={ref}
      />
    );
  },
);
