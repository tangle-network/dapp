'use client';

import { FC } from 'react';

import { LsValidatorTable } from '../../components/LiquidStaking/LsValidatorTable';
import LiquidStakeCard from '../../components/LiquidStaking/stakeAndUnstake/LiquidStakeCard';
import LiquidUnstakeCard from '../../components/LiquidStaking/stakeAndUnstake/LiquidUnstakeCard';
import UnstakeRequestsTable from '../../components/LiquidStaking/unstakeRequestsTable/UnstakeRequestsTable';
import { LsSearchParamKey } from '../../constants/liquidStaking/types';
import useSearchParamState from '../../hooks/useSearchParamState';
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

        {isStaking ? <LiquidStakeCard /> : <LiquidUnstakeCard />}
      </div>

      <div className="flex flex-col flex-grow w-min gap-4 min-w-[370px]">
        {isStaking ? <LsValidatorTable /> : <UnstakeRequestsTable />}
      </div>
    </div>
  );
};

export default LiquidStakingTokenPage;
