'use client';

import { Typography } from '@webb-tools/webb-ui-components';
import { FC, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import LiquidStakeCard from './LiquidStakeCard';
import LiquidUnstakeCard from './LiquidUnstakeCard';

const LiquidStakeAndUnstakeCards: FC = () => {
  const [isStaking, setIsStaking] = useState(true);
  const selectedClass = 'dark:text-mono-0';
  const unselectedClass = 'text-mono-100 dark:text-mono-100';

  return (
    <div className="flex flex-col gap-4 w-full min-w-[550px] max-w-[650px] bg-mono-0 dark:bg-mono-190 rounded-2xl p-9 border dark:border-mono-160 shadow-sm">
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
  );
};

export default LiquidStakeAndUnstakeCards;
