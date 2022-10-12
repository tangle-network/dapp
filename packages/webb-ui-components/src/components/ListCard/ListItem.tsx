import { PropsOf } from '@webb-dapp/webb-ui-components/types';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export const ListItem = forwardRef<HTMLLIElement, PropsOf<'li'>>(({ children, className, ...props }, ref) => {
  return (
    <li {...props} className={twMerge('px-4 py-2 hover:bg-blue-10 dark:hover:bg-blue-120 group', className)} ref={ref}>
      {children}
    </li>
  );
});
