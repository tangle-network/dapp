import type { PropsOf } from '@webb-tools/webb-ui-components/types';
import { useMemo } from 'react';
import { useLocation } from 'react-router';
import { twMerge } from 'tailwind-merge';

import { PagePath } from '../../types';
import TabListItem from './TabListItem';
import TabsList from './TabsList';

export type TabsListProps = PropsOf<'ul'>;

export const tabs = ['deposit', 'stake', 'unstake', 'withdraw'] as const;

const RestakeTabs = (props: TabsListProps) => {
  const location = useLocation();

  const activeTab = useMemo(() => {
    const paths = location.pathname.split('/');

    const activeTab = tabs.find((tab) => paths.some((path) => path === tab));

    return activeTab;
  }, [location.pathname]);

  return (
    <TabsList {...props} className={twMerge('mb-4', props.className)}>
      {tabs.map((tab, idx) => (
        <TabListItem
          href={`${PagePath.RESTAKE}/${tab}`}
          key={`${tab}-${idx}`}
          isActive={activeTab === tab}
          // Hide separator when the tab is directly previous to the active tab
          hideSeparator={activeTab && tabs.indexOf(activeTab) - 1 === idx}
        >
          {`${tab[0].toUpperCase()}${tab.substring(1)}`}
        </TabListItem>
      ))}
    </TabsList>
  );
};

export default RestakeTabs;
