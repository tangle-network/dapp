'use client';

import {
  TabContent,
  TabsList as WebbTabsList,
  TabsRoot,
  TabTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useEffect } from 'react';

import LsStakeCard from '../../components/LiquidStaking/stakeAndUnstake/LsStakeCard';
import LsUnstakeCard from '../../components/LiquidStaking/stakeAndUnstake/LsUnstakeCard';
import StatItem from '../../components/StatItem';
import { LsSearchParamKey } from '../../constants/liquidStaking/types';
import LsMyPoolsTable from '../../containers/LsMyPoolsTable';
import { LsProtocolsTable } from '../../containers/LsPoolsTable';
import useNetworkStore from '../../context/useNetworkStore';
import { useLsStore } from '../../data/liquidStaking/useLsStore';
import useNetworkSwitcher from '../../hooks/useNetworkSwitcher';
import useSearchParamState from '../../hooks/useSearchParamState';
import getLsTangleNetwork from '../../utils/liquidStaking/getLsTangleNetwork';
import TabListItem from '../restake/TabListItem';
import TabsList from '../restake/TabsList';

enum SearchParamAction {
  STAKE = 'stake',
  UNSTAKE = 'unstake',
}

enum Tab {
  ALL_POOLS = 'All Pools',
  MY_POOLS = 'My Pools',
}

const LiquidStakingPage: FC = () => {
  const [isStaking, setIsStaking] = useSearchParamState({
    defaultValue: true,
    key: LsSearchParamKey.ACTION,
    parser: (value) => value === SearchParamAction.STAKE,
    stringify: (value) =>
      value ? SearchParamAction.STAKE : SearchParamAction.UNSTAKE,
  });

  const { lsNetworkId } = useLsStore();
  const { network } = useNetworkStore();
  const { switchNetwork } = useNetworkSwitcher();

  const lsTangleNetwork = getLsTangleNetwork(lsNetworkId);

  // Sync the network with the selected liquid staking network on load.
  // It might differ initially if the user navigates to the page and
  // the active network differs from the default liquid staking network.
  useEffect(() => {
    if (lsTangleNetwork !== null && lsTangleNetwork.id !== network.id) {
      switchNetwork(lsTangleNetwork, false);
    }
  }, [lsTangleNetwork, network.id, lsNetworkId, switchNetwork]);

  return (
    <div className="flex items-stretch flex-col gap-10">
      <div className="p-6 space-y-0 rounded-2xl flex flex-row items-center justify-between w-full overflow-x-auto bg-liquid_staking_banner dark:bg-liquid_staking_banner_dark">
        <div className="flex flex-col gap-2">
          <Typography variant="h5" fw="bold">
            Tangle Liquid Staking
          </Typography>

          <Typography
            variant="body1"
            fw="normal"
            className="text-mono-120 dark:text-mono-100"
          >
            Get Liquid Staking Tokens (LSTs) to earn & unleash restaking on
            Tangle Mainnet via delegation.
          </Typography>
        </div>

        <div className="flex gap-6 h-full">
          <StatItem title="$123.01" subtitle="My Total Staking" largeSubtitle />
        </div>
      </div>

      <div className="flex flex-col self-center gap-4 w-full min-w-[450px] max-w-[600px]">
        <TabsList className="w-full">
          <TabListItem isActive={isStaking} onClick={() => setIsStaking(true)}>
            Stake
          </TabListItem>

          <TabListItem
            isActive={!isStaking}
            onClick={() => setIsStaking(false)}
          >
            Unstake
          </TabListItem>
        </TabsList>

        {isStaking ? <LsStakeCard /> : <LsUnstakeCard />}
      </div>

      <TabsRoot defaultValue={Tab.ALL_POOLS} className="space-y-4">
        <div className="flex justify-between items-center gap-4">
          {/* Tabs List on the left */}
          <WebbTabsList className="space-x-4">
            {Object.values(Tab).map((tab, idx) => {
              return (
                <TabTrigger
                  key={idx}
                  value={tab}
                  isDisableStyle
                  className="text-mono-100 radix-state-active:text-mono-200 dark:radix-state-active:!text-mono-0"
                >
                  <Typography variant="h5" fw="bold" className="!text-inherit">
                    {tab}
                  </Typography>
                </TabTrigger>
              );
            })}
          </WebbTabsList>
        </div>

        {/* Tabs Content */}
        <TabContent value={Tab.ALL_POOLS}>
          <LsProtocolsTable />
        </TabContent>

        <TabContent value={Tab.MY_POOLS}>
          <LsMyPoolsTable />
        </TabContent>
      </TabsRoot>
    </div>
  );
};

export default LiquidStakingPage;
