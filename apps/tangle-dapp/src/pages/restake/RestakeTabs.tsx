import type { PropsOf } from '@tangle-network/ui-components/types';
import { FC, useMemo } from 'react';
import { useLocation } from 'react-router';
import { twMerge } from 'tailwind-merge';

import { PagePath } from '../../types';
import TabListItem from '../../components/restaking/TabListItem';
import TabsList from '../../components/restaking/TabsList';
import { RestakeAction } from '../../constants';

type Props = PropsOf<'ul'>;

const getTabRoute = (tab: RestakeAction): PagePath => {
  switch (tab) {
    case RestakeAction.DEPOSIT:
      return PagePath.RESTAKE_DEPOSIT;
    case RestakeAction.DELEGATE:
      return PagePath.RESTAKE_DELEGATE;
    case RestakeAction.UNDELEGATE:
      return PagePath.RESTAKE_UNDELEGATE;
    case RestakeAction.WITHDRAW:
      return PagePath.RESTAKE_WITHDRAW;
  }
};

const RestakeTabs: FC<Props> = (props) => {
  const location = useLocation();

  const activeTab = useMemo(() => {
    return Object.values(RestakeAction).find(
      (tab) => location.pathname === getTabRoute(tab),
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
