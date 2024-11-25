import cx from 'classnames';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { PropsOf } from '../../types';

export const ListItem = forwardRef<
  HTMLLIElement,
  Omit<PropsOf<'li'>, 'disabled'> & { isDisabled?: boolean }
>(({ children, className, isDisabled, ...props }, ref) => {
  return (
    <li
      {...props}
      className={twMerge(
        'group px-8 py-2',
        'flex items-center justify-between',
        cx({
          'hover:bg-blue-0 dark:hover:bg-mono-170': !isDisabled,
          'opacity-50': isDisabled,
        }),
        className,
      )}
      ref={ref}
    >
      {children}
    </li>
  );
});
