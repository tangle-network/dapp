import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { THeaderProps } from './types';

/**
 * The styler wrapper of `<th></th>` tag, use inside `<thead></thead>` tab for table
 */
export const THeader = forwardRef<HTMLTableCellElement, THeaderProps>(({ children, className, ...props }, ref) => {
  return (
    <th
      {...props}
      className={twMerge(
        'px-2 py-5 text-left border-y body1 first:pl-6 last:pr-6 border-mono-40 dark:border-mono-140 text-mono-140 dark:text-mono-60 bg-mono-0 dark:bg-mono-180',
        className
      )}
      ref={ref}
    >
      {children}
    </th>
  );
});
