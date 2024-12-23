import type { PropsOf } from '@webb-tools/webb-ui-components/types';
import { useMemo } from 'react';
import { useLocation } from 'react-router';
import { twMerge } from 'tailwind-merge';

import { PagePath } from '../../types';
import TabListItem from './TabListItem';
import TabsList from './TabsList';
import { RestakeAction } from '../../constants';

export type TabsListProps = PropsOf<'ul'>;

const getTabRoute = (tab: RestakeAction): PagePath => {
  switch (tab) {
    case RestakeAction.DEPOSIT:
      return PagePath.RESTAKE_DEPOSIT;
    case RestakeAction.STAKE:
      return PagePath.RESTAKE_STAKE;
    case RestakeAction.UNSTAKE:
      return PagePath.RESTAKE_UNSTAKE;
    case RestakeAction.WITHDRAW:
      return PagePath.RESTAKE_WITHDRAW;
  }
};

const RestakeTabs = (props: TabsListProps) => {
  const location = useLocation();

  const activeTab = useMemo(() => {
    const paths = location.pathname.split('/');

    return Object.values(RestakeAction).find((tab) =>
      paths.some((path) => path === tab),
    );
  }, [location.pathname]);

  return (
    <TabsList {...props} className={twMerge('mb-4', props.className)}>
      {Object.values(RestakeAction).map((tab, idx) => (
        <TabListItem
          href={getTabRoute(tab)}
          key={`${tab}-${idx}`}
          isActive={activeTab === tab}
          // Hide separator when the tab is directly previous to the active tab
          hideSeparator={
            activeTab &&
            Object.values(RestakeAction).indexOf(activeTab) - 1 === idx
          }
        >
          {`${tab[0].toUpperCase()}${tab.substring(1)}`}
        </TabListItem>
      ))}
    </TabsList>
  );
};

export default RestakeTabs;
