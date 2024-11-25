'use client';

import { AddLineIcon } from '@webb-tools/icons';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import useNetworkSwitcher from '@webb-tools/tangle-shared-ui/hooks/useNetworkSwitcher';
import {
  Button,
  TabContent,
  TabsList as WebbTabsList,
  TabsRoot,
  TabTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useEffect, useState } from 'react';

import LsUnbondingTable from '../../components/LiquidStaking/LsUnbondingTable';
import LsStakeCard from '../../components/LiquidStaking/stakeAndUnstake/LsStakeCard';
import LsUnstakeCard from '../../components/LiquidStaking/stakeAndUnstake/LsUnstakeCard';
import { LsSearchParamKey } from '../../constants/liquidStaking/types';
import LsCreatePoolModal from '../../containers/LsCreatePoolModal';
import LsMyProtocolsTable from '../../containers/LsMyProtocolsTable';
import { LsAllProtocolsTable } from '../../containers/LsPoolsTable';
import { useLsStore } from '../../data/liquidStaking/useLsStore';
import useIsAccountConnected from '../../hooks/useIsAccountConnected';
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
  UNBONDING = 'Unbonding',
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

  const isAccountConnected = useIsAccountConnected();
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

      <div className="flex flex-col items-stretch gap-10">
        <div className="flex flex-col self-center gap-4 w-full max-w-[532px]">
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
          <div className="flex items-center justify-between gap-4">
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
              isDisabled={!isAccountConnected}
              rightIcon={
                <AddLineIcon className="fill-current dark:fill-current" />
              }
            >
              Create Pool
            </Button>
          </div>

          {/* Tabs' Content */}
          <TabContent value={Tab.ALL_POOLS}>
            <LsAllProtocolsTable />
          </TabContent>

          <TabContent value={Tab.MY_POOLS}>
            <LsMyProtocolsTable />
          </TabContent>

          <TabContent value={Tab.UNBONDING}>
            <LsUnbondingTable />
          </TabContent>
        </TabsRoot>
      </div>
    </div>
  );
};

export default LiquidStakingPage;
