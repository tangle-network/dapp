import { FC, useMemo } from 'react';
import { Link, useLocation } from 'react-router';
import { twMerge } from 'tailwind-merge';

import { PagePath } from '../../types';
import TabsList from '../../components/restaking/TabsList';
import { LiquidStakingTab, LiquidStakingAction } from '../../constants';
import { TabsRoot } from '@tangle-network/ui-components/components/Tabs';
import { Typography } from '@tangle-network/ui-components/typography';

const getTabRoute = (tab: LiquidStakingTab): PagePath => {
  switch (tab) {
    case LiquidStakingTab.STAKE:
      return PagePath.LIQUID_STAKING_DEPOSIT;
    case LiquidStakingTab.VAULTS:
      return PagePath.LIQUID_STAKING_VAULTS;
    case LiquidStakingTab.POSITIONS:
      return PagePath.LIQUID_STAKING_POSITIONS;
  }
};

const LiquidStakingTabs: FC = () => {
  const location = useLocation();

  const activeTab = useMemo(() => {
    return Object.values(LiquidStakingTab).find((tab) => {
      const isLiquidStakingAction = Object.values(LiquidStakingAction).some(
        (tabValue) => location.pathname.includes(tabValue),
      );

      if (isLiquidStakingAction && tab === LiquidStakingTab.STAKE) {
        return true;
      }

      return location.pathname === getTabRoute(tab);
    });
  }, [location.pathname]);

  return (
    <TabsRoot>
      <TabsList className="!bg-transparent space-x-8">
        {Object.values(LiquidStakingTab).map((tab, idx) => (
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
              {`${tab[0].toUpperCase()}${tab.substring(1)}`}
            </Typography>
          </Link>
        ))}
      </TabsList>
    </TabsRoot>
  );
};

export default LiquidStakingTabs;
