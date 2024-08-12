import { FC, PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

const TableCellWrapper: FC<
  PropsWithChildren & {
    isLast?: boolean;
    isActive?: boolean;
  }
> = ({ children, isLast = false, isActive = true }) => {
  return (
    <div
      className={twMerge(
        'flex h-[51px] items-center border-r border-mono-60 dark:border-mono-140',
        isLast ? 'border-r-0' : '',
        !isActive ? 'opacity-50' : '',
      )}
    >
      {children}
    </div>
  );
};

export default TableCellWrapper;
