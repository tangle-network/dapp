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
        'group px-4 py-2 rounded-lg',
        'flex items-center justify-between',
        'bg-mono-0 dark:bg-mono-190',
        'hover:enabled:bg-blue-10 dark:hover:enabled:bg-blue-120',
        cx({ 'opacity-50': isDisabled }),
        className
      )}
      ref={ref}
    >
      {children}
    </li>
  );
});
