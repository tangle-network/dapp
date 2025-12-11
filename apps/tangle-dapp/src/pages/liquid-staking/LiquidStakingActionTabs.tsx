import type { PropsOf } from '@tangle-network/ui-components/types';
import { FC, useMemo } from 'react';
import { useLocation } from 'react-router';
import { twMerge } from 'tailwind-merge';

import { PagePath } from '../../types';
import TabListItem from '../../components/restaking/TabListItem';
import TabsList from '../../components/restaking/TabsList';
import { LiquidStakingAction } from '../../constants';

type Props = PropsOf<'ul'>;

const getTabRoute = (tab: LiquidStakingAction): PagePath => {
  switch (tab) {
    case LiquidStakingAction.DEPOSIT:
      return PagePath.LIQUID_STAKING_DEPOSIT;
    case LiquidStakingAction.REDEEM:
      return PagePath.LIQUID_STAKING_REDEEM;
    case LiquidStakingAction.CREATE_VAULT:
      return PagePath.LIQUID_STAKING_CREATE_VAULT;
  }
};

const getTabLabel = (tab: LiquidStakingAction): string => {
  switch (tab) {
    case LiquidStakingAction.CREATE_VAULT:
      return 'Create Vault';
    default:
      return `${tab[0].toUpperCase()}${tab.substring(1)}`;
  }
};

const LiquidStakingActionTabs: FC<Props> = (props) => {
  const location = useLocation();

  const activeTab = useMemo(() => {
    return Object.values(LiquidStakingAction).find(
      (tab) => location.pathname === getTabRoute(tab),
    );
  }, [location.pathname]);

  return (
    <TabsList {...props} className={twMerge('mb-4', props.className)}>
      {Object.values(LiquidStakingAction).map((tab, idx) => (
        <TabListItem
          href={getTabRoute(tab)}
          key={`${tab}-${idx}`}
          isActive={activeTab === tab}
          hideSeparator={
            activeTab &&
            Object.values(LiquidStakingAction).indexOf(activeTab) - 1 === idx
          }
        >
          {getTabLabel(tab)}
        </TabListItem>
      ))}
    </TabsList>
  );
};

export default LiquidStakingActionTabs;
