import { Chip } from '@webb-tools/webb-ui-components';
import { PropsOf } from '@webb-tools/webb-ui-components/types';
import { FC, PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

export const SmallChip: FC<PropsWithChildren<PropsOf<typeof Chip>>> = ({
  children,
  className,
  ...rest
}) => {
  return (
    <Chip
      color="grey"
      {...rest}
      className={twMerge(
        'bg-mono-60 dark:bg-mono-140 shadow-md px-2',
        className
      )}
    >
      {children}
    </Chip>
  );
};
