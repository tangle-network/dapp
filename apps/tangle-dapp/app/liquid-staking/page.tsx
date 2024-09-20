'use client';

import { FC } from 'react';

import { LsValidatorTable } from '../../components/LiquidStaking/LsValidatorTable';
import LsStakeCard from '../../components/LiquidStaking/stakeAndUnstake/LsStakeCard';
import LsUnstakeCard from '../../components/LiquidStaking/stakeAndUnstake/LsUnstakeCard';
import UnstakeRequestsTable from '../../components/LiquidStaking/unstakeRequestsTable/UnstakeRequestsTable';
import { LsSearchParamKey } from '../../constants/liquidStaking/types';
import LsPoolsTable from '../../containers/LsPoolsTable';
import { useLsStore } from '../../data/liquidStaking/useLsStore';
import useSearchParamState from '../../hooks/useSearchParamState';
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

  const { selectedProtocolId } = useLsStore();

  const isParachainChain = isLsParachainChainId(selectedProtocolId);

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
