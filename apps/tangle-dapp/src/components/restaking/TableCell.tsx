import { Typography } from '@tangle-network/webb-ui-components/typography/Typography';
import type { ComponentProps, FC } from 'react';
import { twMerge } from 'tailwind-merge';

const TableCell: FC<Partial<ComponentProps<typeof Typography>>> = ({
  className,
  children,
  variant = 'body2',
  ...props
}) => {
  return (
    <Typography
      component="span"
      fw="semibold"
      {...props}
      variant={variant}
      className={twMerge('text-mono-120 dark:text-mono-100', className)}
    >
      {children}
    </Typography>
  );
};

export default TableCell;
