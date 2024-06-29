import type { PropsOf } from '@webb-tools/webb-ui-components/types';
import { twMerge } from 'tailwind-merge';

export type TabListItemProps = PropsOf<'li'> & {
  isActive?: boolean;
};

export default function TabListItem({
  className,
  isActive,
  ...props
}: TabListItemProps) {
  return (
    <li
      {...props}
      className={twMerge(
        'h4 font-bold',
        isActive ? 'text-mono-200 dark:text-mono-0' : 'text-mono-100',
      )}
    />
  );
}
