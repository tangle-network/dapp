import cx from 'classnames';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { TDataProps } from './types';

/**
 * The styler wrapper of `<td></td>` tag, use inside `<tbody></tbody>` tab for table
 */
export const TData = forwardRef<HTMLTableCellElement, TDataProps>(({ children, className, ...props }, ref) => {
  return (
    <td
      {...props}
      className={twMerge(
        cx(
          'px-2 py-4 text-left border-t first:pl-6 last:pr-6 body1',
          'border-mono-40 dark:border-mono-140',
          'text-mono-140 dark:text-mono-60',
          'bg-mono-0 dark:bg-mono-180',
          'group-hover:bg-blue-0 dark:group-hover:bg-mono-160'
        ),
        className
      )}
      ref={ref}
    >
      {children}
    </td>
  );
});
