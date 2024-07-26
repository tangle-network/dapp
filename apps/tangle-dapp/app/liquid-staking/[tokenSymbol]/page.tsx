'use client';

import { Typography } from '@webb-tools/webb-ui-components';
import { notFound } from 'next/navigation';
import { FC, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { LiquidStakingSelectionTable } from '../../../components/LiquidStaking/LiquidStakingSelectionTable';
import LiquidStakeCard from '../../../components/LiquidStaking/stakeAndUnstake/LiquidStakeCard';
import LiquidUnstakeCard from '../../../components/LiquidStaking/stakeAndUnstake/LiquidUnstakeCard';
import UnstakeRequestsTable from '../../../components/LiquidStaking/unstakeRequestsTable/UnstakeRequestsTable';
import isLiquidStakingToken from '../../../utils/liquidStaking/isLiquidStakingToken';

type Props = {
  params: { tokenSymbol: string };
};

const LiquidStakingTokenPage: FC<Props> = ({ params: { tokenSymbol } }) => {
  const [isStaking, setIsStaking] = useState(true);

  if (!isLiquidStakingToken(tokenSymbol)) {
    return notFound();
  }

  const selectedClass = 'dark:text-mono-0';
  const unselectedClass = 'text-mono-100 dark:text-mono-100';

  return (
    <div className="grid grid-cols-2 gap-12">
      <div className="flex flex-col gap-4 w-full min-w-[450px] max-w-[600px]">
        <div className="flex gap-3">
          <Typography
            onClick={() => setIsStaking(true)}
            className={twMerge(
              isStaking ? selectedClass : unselectedClass,
              !isStaking && 'cursor-pointer',
            )}
            variant="h4"
            fw="bold"
          >
            Stake
          </Typography>

          <Typography
            onClick={() => setIsStaking(false)}
            className={twMerge(
              !isStaking ? selectedClass : unselectedClass,
              isStaking && 'cursor-pointer',
            )}
            variant="h4"
            fw="bold"
          >
            Unstake
          </Typography>
        </div>

        {isStaking ? <LiquidStakeCard /> : <LiquidUnstakeCard />}
      </div>

      <div className="flex flex-col gap-4">
        {isStaking ? <LiquidStakingSelectionTable /> : <UnstakeRequestsTable />}
      </div>
    </div>
  );
};

export default LiquidStakingTokenPage;
