import { TableCell } from '@tangle-network/ui/primitives';
import { forwardRef, memo } from 'react';
import { twMerge } from 'tailwind-merge';
import { TDataProps } from './types';

export const TData = forwardRef<HTMLTableCellElement, TDataProps>(
  ({ className, isDisabledHoverStyle, ...props }, ref) => (
    <TableCell
      {...props}
      ref={ref}
      className={twMerge(
        !isDisabledHoverStyle && 'group-hover/tr:bg-muted/50',
        className,
      )}
    />
  ),
);
export const TDataMemo = memo(TData);
