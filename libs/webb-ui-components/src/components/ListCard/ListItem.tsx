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
        'group max-w-lg px-4 py-2 rounded-lg',
        'flex items-center justify-between',
        'bg-mono-0 dark:bg-mono-190',

        cx({
          'hover:bg-blue-10 dark:hover:bg-blue-120': !isDisabled,
          'opacity-70': isDisabled,
        }),
        className
      )}
      ref={ref}
    >
      {children}
    </li>
  );
});
