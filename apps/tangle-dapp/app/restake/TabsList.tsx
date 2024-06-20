'use client';

import type { PropsOf } from '@webb-tools/webb-ui-components/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

export type TabsListProps = PropsOf<'ul'>;

const tabs = ['deposit', 'delegate'] as const;

const TabsList = ({ className, ...props }: TabsListProps) => {
  const pathname = usePathname();

  const activeTab = useMemo(() => {
    const paths = pathname.split('/');

    const activeTab = tabs.find((tab) => paths.some((path) => path === tab));

    return activeTab;
  }, [pathname]);

  return (
    <ul
      {...props}
      className={twMerge(
        'flex items-center gap-4 overflow-x-scroll',
        className,
      )}
    >
      {tabs.map((tab, idx) => (
        <li key={`${tab}-${idx}`}>
          <Link
            href={tab}
            className={twMerge(
              'h4 font-bold',
              activeTab === tab
                ? 'text-mono-200 dark:text-mono-0'
                : 'text-mono-100',
            )}
          >
            {`${tab[0].toUpperCase()}${tab.substring(1)}`}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default TabsList;
