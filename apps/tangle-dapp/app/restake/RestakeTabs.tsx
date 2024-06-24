'use client';

import type { PropsOf } from '@webb-tools/webb-ui-components/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import TabListItem from './TabListItem';
import TabsList from './TabsList';

export type TabsListProps = PropsOf<'ul'>;

export const tabs = ['deposit', 'delegate'] as const;

const RestakeTabs = (props: TabsListProps) => {
  const pathname = usePathname();

  const activeTab = useMemo(() => {
    const paths = pathname.split('/');

    const activeTab = tabs.find((tab) => paths.some((path) => path === tab));

    return activeTab;
  }, [pathname]);

  return (
    <TabsList {...props}>
      {tabs.map((tab, idx) => (
        <TabListItem key={`${tab}-${idx}`} isActive={activeTab === tab}>
          <Link href={tab} className="text-inherit">
            {`${tab[0].toUpperCase()}${tab.substring(1)}`}
          </Link>
        </TabListItem>
      ))}
    </TabsList>
  );
};

export default RestakeTabs;
