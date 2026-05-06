import { Typography } from '@tangle-network/ui-components/typography/Typography';
import type { ComponentProps, FC } from 'react';
import { twMerge } from 'tailwind-merge';

type Props = Partial<ComponentProps<typeof Typography>>;

const TableCell: FC<Props> = ({
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
