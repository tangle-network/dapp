'use client';

import { notFound } from 'next/navigation';
import { FC } from 'react';
import { z } from 'zod';

import { LiquidStakingSelectionTable } from '../../../components/LiquidStaking/LiquidStakingSelectionTable';
import LiquidStakeCard from '../../../components/LiquidStaking/stakeAndUnstake/LiquidStakeCard';
import LiquidUnstakeCard from '../../../components/LiquidStaking/stakeAndUnstake/LiquidUnstakeCard';
import UnstakeRequestsTable from '../../../components/LiquidStaking/unstakeRequestsTable/UnstakeRequestsTable';
import { LsSearchParamKey } from '../../../constants/liquidStaking';
import useSearchParamState from '../../../hooks/useSearchParamState';
import isLiquidStakingToken from '../../../utils/liquidStaking/isLiquidStakingToken';
import TabListItem from '../../restake/TabListItem';
import TabsList from '../../restake/TabsList';

type Props = {
  params: { tokenSymbol: string };
};

export enum LsSearchParamAction {
  STAKE = 'stake',
  UNSTAKE = 'unstake',
}

const LiquidStakingTokenPage: FC<Props> = ({ params: { tokenSymbol } }) => {
  const [isStaking, setIsStaking] = useSearchParamState({
    defaultValue: true,
    key: LsSearchParamKey.ACTION,
    parser: (value) =>
      z.nativeEnum(LsSearchParamAction).parse(value) ===
      LsSearchParamAction.STAKE,
    stringify: (value) =>
      value ? LsSearchParamAction.STAKE : LsSearchParamAction.UNSTAKE,
  });

  if (!isLiquidStakingToken(tokenSymbol)) {
    return notFound();
  }

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
        {isStaking ? <LiquidStakingSelectionTable /> : <UnstakeRequestsTable />}
      </div>
    </div>
  );
};

export default LiquidStakingTokenPage;
