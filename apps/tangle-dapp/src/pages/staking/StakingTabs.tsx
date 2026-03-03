import { FC, useMemo } from 'react';
import { Link, useLocation } from 'react-router';
import { twMerge } from 'tailwind-merge';

import { PagePath } from '../../types';
import TabsList from '../../components/staking/TabsList';
import { StakingTab, StakingAction } from '../../constants';
import { TabsRoot } from '@tangle-network/ui-components/components/Tabs';
import { Typography } from '@tangle-network/ui-components/typography';

const getTabRoute = (tab: StakingTab): PagePath => {
  switch (tab) {
    case StakingTab.STAKING:
      return PagePath.STAKING_DEPOSIT;
    case StakingTab.VAULTS:
      return PagePath.STAKING_VAULT;
    case StakingTab.OPERATORS:
      return PagePath.STAKING_OPERATOR;
    case StakingTab.BLUEPRINTS:
      return PagePath.STAKING_BLUEPRINT;
    case StakingTab.REWARDS:
      return PagePath.STAKING_REWARDS;
  }
};

const StakingTabs: FC = () => {
  const location = useLocation();

  const activeTab = useMemo(() => {
    return Object.values(StakingTab).find((tab) => {
      const isStakingAction = Object.values(StakingAction).some((tabValue) =>
        location.pathname.includes(tabValue),
      );

      if (isStakingAction && tab === StakingTab.STAKING) {
        return true;
      }

      return location.pathname === getTabRoute(tab);
    });
  }, [location.pathname]);

  const getTabLabel = (tab: StakingTab): string => {
    if (tab === StakingTab.STAKING) {
      return 'Stake';
    }

    return `${tab[0].toUpperCase()}${tab.substring(1)}`;
  };

  return (
    <TabsRoot>
      <TabsList className="!bg-transparent space-x-8">
        {Object.values(StakingTab).map((tab, idx) => (
          <Link
            to={getTabRoute(tab)}
            key={`${tab}-${idx}`}
            className={twMerge(
              'transition-colors pb-1 border-b-2',
              tab === activeTab
                ? 'border-mono-200 dark:border-mono-0 text-mono-200 dark:text-mono-0'
                : 'text-mono-120 hover:text-mono-140 border-transparent',
            )}
          >
            <Typography variant="h5" fw="bold" className="!text-inherit">
              {getTabLabel(tab)}
            </Typography>
          </Link>
        ))}
      </TabsList>
    </TabsRoot>
  );
};

export default StakingTabs;
