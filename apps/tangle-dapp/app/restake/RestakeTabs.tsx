'use client';

import type { PropsOf } from '@webb-tools/webb-ui-components/types';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import TabListItem from './TabListItem';
import TabsList from './TabsList';

export type TabsListProps = PropsOf<'ul'>;

export const tabs = ['deposit', 'stake'] as const;

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
        <TabListItem
          href={tab}
          key={`${tab}-${idx}`}
          isActive={activeTab === tab}
        >
          {`${tab[0].toUpperCase()}${tab.substring(1)}`}
        </TabListItem>
      ))}
    </TabsList>
  );
};

export default RestakeTabs;
