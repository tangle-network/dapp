'use client';

import {
  AddLineIcon,
  CoinIcon,
  EditLine,
  Search,
  SparklingIcon,
  WaterDropletIcon,
} from '@webb-tools/icons';
import {
  Button,
  TabContent,
  TabsList as WebbTabsList,
  TabsRoot,
  TabTrigger,
  TANGLE_DOCS_LIQUID_STAKING_URL,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useEffect, useState } from 'react';

import LsStakeCard from '../../components/LiquidStaking/stakeAndUnstake/LsStakeCard';
import LsUnstakeCard from '../../components/LiquidStaking/stakeAndUnstake/LsUnstakeCard';
import OnboardingItem from '../../components/OnboardingModal/OnboardingItem';
import OnboardingModal from '../../components/OnboardingModal/OnboardingModal';
import StatItem from '../../components/StatItem';
import { OnboardingPageKey } from '../../constants';
import { LsSearchParamKey } from '../../constants/liquidStaking/types';
import LsCreatePoolModal from '../../containers/LsCreatePoolModal';
import LsMyProtocolsTable from '../../containers/LsMyProtocolsTable';
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

  const {
    lsNetworkId,
    setIsStaking: setIsStakingInStore,
    isStaking: isStakingInStore,
  } = useLsStore();

  const { network } = useNetworkStore();
  const { switchNetwork } = useNetworkSwitcher();
  const [isCreatePoolModalOpen, setIsCreatePoolModalOpen] = useState(false);

  const lsTangleNetwork = getLsTangleNetwork(lsNetworkId);

  // Sync the network with the selected liquid staking network on load.
  // It might differ initially if the user navigates to the page and
  // the active network differs from the default liquid staking network.
  useEffect(() => {
    if (lsTangleNetwork !== null && lsTangleNetwork.id !== network.id) {
      switchNetwork(lsTangleNetwork, false);
    }
  }, [lsTangleNetwork, network.id, lsNetworkId, switchNetwork]);

  // Sync the Zustand store state of whether liquid staking or unstaking with
  // the URL param state.
  useEffect(() => {
    setIsStakingInStore(isStaking);
  }, [isStaking, setIsStakingInStore]);

  // Sync the URL param state of whether liquid staking or unstaking with
  // the Zustand store state.
  useEffect(() => {
    setIsStaking(isStakingInStore);
  }, [isStakingInStore, setIsStaking]);

  return (
    <div>
      <LsCreatePoolModal
        isOpen={isCreatePoolModalOpen}
        setIsOpen={setIsCreatePoolModalOpen}
      />

      <OnboardingModal
        title="Get Started with Liquid Staking"
        pageKey={OnboardingPageKey.LIQUID_STAKING}
        learnMoreHref={TANGLE_DOCS_LIQUID_STAKING_URL}
      >
        <OnboardingItem
          Icon={Search}
          title="Explore Liquid Staking Pools"
          description="Browse existing liquid staking pools on Tangle or the Restaking Parachain. Sort them by APY, TVL, or create your own pool."
        />

        <OnboardingItem
          Icon={WaterDropletIcon}
          title="Stake Your Assets"
          description="Select a pool, enter the amount you'd like to stake, and click 'Stake' to start staking in the pool."
        />

        <OnboardingItem
          Icon={EditLine}
          title="View and Manage Your Pools"
          description="After staking, use the 'My Pools' tab to view, increase stake, unstake, or manage your pools."
        />

        <OnboardingItem
          Icon={CoinIcon}
          title="Obtain derivative tokens"
          description="When you join a pool, you'll automatically receive its derivative asset, which can be traded and used within Tangle's restaking infrastructure."
        />

        <OnboardingItem
          Icon={SparklingIcon}
          title="Earn Rewards While Staying Liquid"
          description="Use or trade your derivative tokens while automatically earning staking rewards. That's the magic of liquid staking!"
        />
      </OnboardingModal>

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
            <StatItem title="$123.01" subtitle="My Total Staking" />
          </div>
        </div>

        <div className="flex flex-col self-center gap-4 w-full min-w-[450px] max-w-[532px]">
          <TabsList className="w-full">
            <TabListItem
              isActive={isStaking}
              onClick={() => setIsStaking(true)}
            >
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
                    <Typography
                      variant="h5"
                      fw="bold"
                      className="!text-inherit"
                    >
                      {tab}
                    </Typography>
                  </TabTrigger>
                );
              })}
            </WebbTabsList>

            {/**
             * TODO: Check what's the min. amount required to create a new pool. If the free balance doesn't meet the min, disable the button and show a tooltip with the reason.
             */}
            <Button
              onClick={() => setIsCreatePoolModalOpen(true)}
              variant="utility"
              size="sm"
              rightIcon={
                <AddLineIcon className="fill-current dark:fill-current" />
              }
            >
              Create Pool
            </Button>
          </div>

          {/* Tabs Content */}
          <TabContent value={Tab.ALL_POOLS}>
            <LsProtocolsTable />
          </TabContent>

          <TabContent value={Tab.MY_POOLS}>
            <LsMyProtocolsTable />
          </TabContent>
        </TabsRoot>
      </div>
    </div>
  );
};

export default LiquidStakingPage;
