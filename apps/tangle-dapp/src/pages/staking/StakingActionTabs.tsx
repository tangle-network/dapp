import type { PropsOf } from '@tangle-network/ui-components/types';
import { FC, useMemo } from 'react';
import { useLocation } from 'react-router';
import { twMerge } from 'tailwind-merge';

import { PagePath } from '../../types';
import TabListItem from '../../components/staking/TabListItem';
import TabsList from '../../components/staking/TabsList';
import { StakingAction } from '../../constants';

type Props = PropsOf<'ul'>;

const getTabRoute = (tab: StakingAction): PagePath => {
  switch (tab) {
    case StakingAction.DEPOSIT:
      return PagePath.STAKING_DEPOSIT;
    case StakingAction.DELEGATE:
      return PagePath.STAKING_DELEGATE;
    case StakingAction.UNDELEGATE:
      return PagePath.STAKING_UNDELEGATE;
    case StakingAction.WITHDRAW:
      return PagePath.STAKING_WITHDRAW;
  }
};

const StakingActionTabs: FC<Props> = (props) => {
  const location = useLocation();

  const activeTab = useMemo(() => {
    return Object.values(StakingAction).find(
      (tab) => location.pathname === getTabRoute(tab),
    );
  }, [location.pathname]);

  return (
    <TabsList {...props} className={twMerge('mb-4', props.className)}>
      {Object.values(StakingAction).map((tab, idx) => (
        <TabListItem
          href={getTabRoute(tab)}
          key={`${tab}-${idx}`}
          isActive={activeTab === tab}
          // Hide separator when the tab is directly previous to the active tab
          hideSeparator={
            activeTab &&
            Object.values(StakingAction).indexOf(activeTab) - 1 === idx
          }
        >
          {`${tab[0].toUpperCase()}${tab.substring(1)}`}
        </TabListItem>
      ))}
    </TabsList>
  );
};

export default StakingActionTabs;
