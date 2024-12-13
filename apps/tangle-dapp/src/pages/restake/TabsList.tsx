import type { PropsOf } from '@webb-tools/webb-ui-components/types';
import { twMerge } from 'tailwind-merge';

export type TabsListProps = PropsOf<'ul'>;

const TabsList = ({ className, ...props }: TabsListProps) => {
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
