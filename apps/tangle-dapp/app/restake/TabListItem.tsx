import type { PropsOf } from '@webb-tools/webb-ui-components/types';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

export type TabListItemProps = PropsOf<'li'> & {
  isActive?: boolean;
  href: ComponentProps<typeof Link>['href'];
};

export default function TabListItem({
  className,
  isActive,
  children,
  href,
  ...props
}: TabListItemProps) {
  return (
    <li
      {...props}
      className={twMerge(
        'p-1 flex-1 flex justify-center grow min-h-[45px]',
        className,
      )}
    >
      <Link href={href} className={twMerge('relative transition grow')}>
        {isActive && (
          <motion.span
            layoutId="bubble"
            className="absolute inset-0 rounded-lg bg-mono-0 dark:bg-purple-50"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
        )}

        <span
          className={twMerge(
            'absolute body2 w-full p-2 text-center',
            isActive && 'font-bold',
            isActive
              ? 'text-mono-200 dark:text-mono-0'
              : 'text-mono-120 dark:text-mono-80',
          )}
        >
          {children}
        </span>
      </Link>
    </li>
  );
}
