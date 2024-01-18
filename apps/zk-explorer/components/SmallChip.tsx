import { Chip } from '@webb-tools/webb-ui-components';
import { PropsOf } from '@webb-tools/webb-ui-components/types';
import { FC, PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

const SmallChip: FC<PropsWithChildren<PropsOf<typeof Chip>>> = ({
  children,
  className,
  ...rest
}) => {
  return (
    <Chip
      color="grey"
      {...rest}
      className={twMerge(
        'bg-mono-100 dark:bg-mono-140',
        '!text-mono-0 px-2',
        className
      )}
    >
      {children}
    </Chip>
  );
};

export default SmallChip;
