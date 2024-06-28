import type { PropsOf } from '@webb-tools/webb-ui-components/types';
import { twMerge } from 'tailwind-merge';

export type TabsListProps = PropsOf<'ul'>;

const TabsList = ({ className, ...props }: TabsListProps) => {
  return (
    <ul
      {...props}
      className={twMerge(
        'flex items-center gap-4 overflow-x-scroll',
        className,
      )}
    />
  );
};

export default TabsList;
