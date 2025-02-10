import { AddLineIcon } from '@webb-tools/icons';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import {
  Button,
  TabContent,
  TabsRoot,
  TabTrigger,
  Typography,
  TabsList as WebbTabsList,
} from '@webb-tools/webb-ui-components';
import { FC, useEffect, useState } from 'react';

import LsUnbondingTable from '../../components/LiquidStaking/LsUnbondingTable';
import LsStakeCard from '../../components/LiquidStaking/stakeAndUnstake/LsStakeCard';
import LsUnstakeCard from '../../components/LiquidStaking/stakeAndUnstake/LsUnstakeCard';
import LsCreatePoolModal from '../../containers/LsCreatePoolModal';
import LsMyProtocolsTable from '../../containers/LsMyProtocolsTable';
import { LsAllProtocolsTable } from '../../containers/LsPoolsTable';
import { useLsStore } from '../../data/liquidStaking/useLsStore';
import useIsAccountConnected from '../../hooks/useIsAccountConnected';
import getLsTangleNetwork from '../../utils/liquidStaking/getLsTangleNetwork';
import TabListItem from '../../components/restaking/TabListItem';
import TabsList from '../../components/restaking/TabsList';
import findLsNetworkByChainId from '../../utils/liquidStaking/findLsNetworkByChainId';

enum Tab {
  ALL_POOLS = 'All Pools',
  MY_POOLS = 'My Pools',
  UNBONDING = 'Unbonding',
}

const LiquidStakingPage: FC = () => {
  const [isStaking, setIsStaking] = useState(true);

  const {
    lsNetworkId,
    setIsStaking: setIsStakingInStore,
    isStaking: isStakingInStore,
    setSelectedNetworkId,
  } = useLsStore();

  const isAccountConnected = useIsAccountConnected();
  const { network } = useNetworkStore();
  const [isCreatePoolModalOpen, setIsCreatePoolModalOpen] = useState(false);

  const lsTangleNetwork = getLsTangleNetwork(lsNetworkId);

  // Sync the network with the selected liquid staking network on load.
  // It might differ initially if the user navigates to the page and
  // the active network differs from the default liquid staking network.
  useEffect(() => {
    const newLsNetworkId = findLsNetworkByChainId(network.id);

    if (lsTangleNetwork.id !== network.id && newLsNetworkId !== null) {
      setSelectedNetworkId(newLsNetworkId);
    }

    // Run once on load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync the Zustand store state of whether liquid staking or unstaking with
  // the URL param state.
  useEffect(() => {
    setIsStakingInStore(isStaking);
  }, [isStaking, setIsStakingInStore]);

  useEffect(() => {
    setIsStaking(isStakingInStore);
  }, [isStakingInStore, setIsStaking]);

  return (
    <div>
      <Typography
        variant="h4"
        fw="bold"
        className="text-mono-200 dark:text-mono-0 max-w-[532px] mx-auto w-full text-left mb-5"
      >
        Liquid Stake
      </Typography>

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
