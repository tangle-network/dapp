'use client';

import { notFound } from 'next/navigation';
import { FC, useEffect, useState } from 'react';
import { z } from 'zod';

import { LiquidStakingSelectionTable } from '../../../components/LiquidStaking/LiquidStakingSelectionTable';
import LiquidStakeCard from '../../../components/LiquidStaking/stakeAndUnstake/LiquidStakeCard';
import LiquidUnstakeCard from '../../../components/LiquidStaking/stakeAndUnstake/LiquidUnstakeCard';
import UnstakeRequestsTable from '../../../components/LiquidStaking/unstakeRequestsTable/UnstakeRequestsTable';
import useTypedSearchParams from '../../../hooks/useTypedSearchParams';
import isLiquidStakingToken from '../../../utils/liquidStaking/isLiquidStakingToken';
import TabListItem from '../../restake/TabListItem';
import TabsList from '../../restake/TabsList';

type Props = {
  params: { tokenSymbol: string };
};

export enum LsSearchParamAction {
  Stake = 'stake',
  Unstake = 'unstake',
}

const LiquidStakingTokenPage: FC<Props> = ({ params: { tokenSymbol } }) => {
  const [isStaking, setIsStaking] = useState(true);

  const { searchParams, setSearchParam } = useTypedSearchParams({
    action: (value) => z.nativeEnum(LsSearchParamAction).parse(value),
  });

  // In case an action is provided in the URL search params,
  // set the staking state accordingly.
  useEffect(() => {
    if (searchParams.action === undefined) {
      return;
    }

    setIsStaking(searchParams.action === LsSearchParamAction.Stake);
  }, [searchParams.action]);

  // Maintain URL search params in sync with the state.
  useEffect(() => {
    const value = isStaking
      ? LsSearchParamAction.Stake
      : LsSearchParamAction.Unstake;

    setSearchParam('action', value);
  }, [isStaking, setSearchParam]);

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
