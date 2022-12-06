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
        'px-4 py-2 hover:bg-blue-10 dark:hover:bg-blue-120 group',
        cx({ 'opacity-50': isDisabled }),
        className
      )}
      ref={ref}
    >
      {children}
    </li>
  );
});
