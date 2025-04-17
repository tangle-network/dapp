import type { PropsOf } from '@tangle-network/ui-components/types';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

type Props = PropsOf<'ul'>;

const TabsList: FC<Props> = ({ className, ...props }) => {
  return (
    <ul
      {...props}
      role="tablist"
      className={twMerge(
        'flex items-center flex-wrap bg-mono-20 dark:bg-mono-180 rounded-xl',
        className,
      )}
    />
  );
};

export default TabsList;
