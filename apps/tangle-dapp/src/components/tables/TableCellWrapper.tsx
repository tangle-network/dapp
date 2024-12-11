import { FC, PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

const TableCellWrapper: FC<
  PropsWithChildren & {
    removeRightBorder?: boolean;
    className?: string;
  }
> = ({ children, className, removeRightBorder = false }) => {
  return (
    <div
      className={twMerge(
        'py-3 pr-3 flex min-h-[75px] items-center justify-between',
        className,
      )}
    >
      {children}
      {!removeRightBorder && (
        <div className="w-px h-[51px] bg-mono-60 dark:bg-mono-140" />
      )}
    </div>
  );
};

export default TableCellWrapper;
