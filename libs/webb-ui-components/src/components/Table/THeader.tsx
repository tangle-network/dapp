import { forwardRef, memo } from 'react';
import { twMerge } from 'tailwind-merge';

import { THeaderProps } from './types';

/**
 * The styler wrapper of `<th></th>` tag, use inside `<thead></thead>` tab for table
 */
export const THeader = forwardRef<HTMLTableCellElement, THeaderProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <th
        {...props}
        className={twMerge(
          'first:pl-3 last:pr-3 text-left border-b body2 border-mono-40 dark:border-mono-140 bg-mono-0 dark:bg-mono-180',
          className,
        )}
        ref={ref}
      >
        {children}
      </th>
    );
  },
);

export const THeaderMemo = memo(THeader);
