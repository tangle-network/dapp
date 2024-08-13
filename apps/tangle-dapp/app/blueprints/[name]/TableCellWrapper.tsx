import { FC, PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

const TableCellWrapper: FC<
  PropsWithChildren & {
    removeBorder?: boolean;
    className?: string;
    disableHoverEffect?: boolean;
  }
> = ({
  children,
  removeBorder = false,
  className,
  disableHoverEffect = false,
}) => {
  return (
    <div
      className={twMerge(
        'py-3 pr-3 flex h-[75px] items-center justify-between bg-mono-0 dark:bg-mono-190',
        !disableHoverEffect &&
          'group-hover:bg-mono-20 dark:group-hover:bg-mono-170',
        className,
      )}
    >
      {children}
      {!removeBorder && (
        <div className="w-px h-[51px] bg-mono-60 dark:bg-mono-140" />
      )}
    </div>
  );
};

export default TableCellWrapper;
