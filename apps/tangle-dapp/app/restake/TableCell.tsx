import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import type { ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

export default function TableCell({
  className,
  children,
  variant = 'body2',
  ...props
}: Partial<ComponentProps<typeof Typography>>) {
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
}
