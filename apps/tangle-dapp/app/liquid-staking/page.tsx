'use client';

import { FC, useEffect } from 'react';

import { LsValidatorTable } from '../../components/LiquidStaking/LsValidatorTable';
import LsStakeCard from '../../components/LiquidStaking/stakeAndUnstake/LsStakeCard';
import LsUnstakeCard from '../../components/LiquidStaking/stakeAndUnstake/LsUnstakeCard';
import UnstakeRequestsTable from '../../components/LiquidStaking/unstakeRequestsTable/UnstakeRequestsTable';
import { LsSearchParamKey } from '../../constants/liquidStaking/types';
import LsPoolsTable from '../../containers/LsPoolsTable';
import useNetworkStore from '../../context/useNetworkStore';
import { useLsStore } from '../../data/liquidStaking/useLsStore';
import useNetworkSwitcher from '../../hooks/useNetworkSwitcher';
import useSearchParamState from '../../hooks/useSearchParamState';
import getLsTangleNetwork from '../../utils/liquidStaking/getLsTangleNetwork';
import isLsParachainChainId from '../../utils/liquidStaking/isLsParachainChainId';
import TabListItem from '../restake/TabListItem';
import TabsList from '../restake/TabsList';

enum SearchParamAction {
  STAKE = 'stake',
  UNSTAKE = 'unstake',
}

const LiquidStakingTokenPage: FC = () => {
  const [isStaking, setIsStaking] = useSearchParamState({
    defaultValue: true,
    key: LsSearchParamKey.ACTION,
    parser: (value) => value === SearchParamAction.STAKE,
    stringify: (value) =>
      value ? SearchParamAction.STAKE : SearchParamAction.UNSTAKE,
  });

  const { selectedProtocolId, selectedNetworkId } = useLsStore();
  const { network } = useNetworkStore();
  const { switchNetwork } = useNetworkSwitcher();

  const lsTangleNetwork = getLsTangleNetwork(selectedNetworkId);
  const isParachainChain = isLsParachainChainId(selectedProtocolId);

  // Sync the network with the selected liquid staking network on load.
  // It might differ initially if the user navigates to the page and
  // the active network differs from the default liquid staking network.
  useEffect(() => {
    if (lsTangleNetwork !== null && lsTangleNetwork.id !== network.id) {
      switchNetwork(lsTangleNetwork, false);
    }
  }, [lsTangleNetwork, network.id, selectedNetworkId, switchNetwork]);

  return (
    <div className="flex flex-wrap gap-12">
      <div className="flex flex-col gap-4 w-full min-w-[450px] max-w-[600px]">
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

      <div className="flex flex-col flex-grow w-min gap-4 min-w-[370px]">
        {isStaking ? (
          isParachainChain ? (
            <LsPoolsTable />
          ) : (
            <LsValidatorTable />
          )
        ) : (
          <UnstakeRequestsTable />
        )}
      </div>
    </div>
  );
};

export default LiquidStakingTokenPage;
