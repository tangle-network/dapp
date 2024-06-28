'use client';

import { notFound } from 'next/navigation';
import { FC, useState } from 'react';

import LiquidStakingCard from '../../../components/LiquidStaking/LiquidStakingCard';
import TokenInfoCard from '../../../components/LiquidStaking/TokenInfoCard';
import ValidatorSelectionTable from '../../../components/LiquidStaking/ValidatorSelectionTable';
import {
  LIQUID_STAKING_TOKEN_PREFIX,
  LiquidStakingToken,
} from '../../../constants/liquidStaking';
import isLiquidStakingToken from '../../../utils/liquidStaking/isLiquidStakingToken';

type Props = {
  params: { tokenSymbol: string };
};

const LiquidStakingTokenPage: FC<Props> = ({ params: { tokenSymbol } }) => {
  // const { isLoading, data: validators } = useValidators();
  // console.debug('Validators:', validators);

  const [selectedValidators, setSelectedValidators] = useState<Set<string>>(
    new Set(),
  );

  console.debug('Selected Validators:', selectedValidators);

  const possibleTokens = Object.values(LiquidStakingToken).map((value) =>
    value.toString(),
  );

  // Invalid token provided on the URL parameters.
  if (!isLiquidStakingToken(tokenSymbol)) {
    return notFound();
  }

  const validators = [
    {
      address: 'gXCcrjjFX3RPyhHYgwZDmw8oe4JFpd5anko3nTY8VrmnJpe',
      identity: 'Alice',
      totalValueStaked: 100,
      annualPercentageYield: 5.03,
      commission: 1,
    },
    {
      address: 'ezhQxhdSnw9sacSeYZwU6UTXvinnb6bWjsoXRcyLv84JY7b',
      identity: 'Bob',
      totalValueStaked: 200,
      annualPercentageYield: 4.03,
      commission: 1,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-12">
      <div className="flex flex-col gap-4">
        <TokenInfoCard
          stakingInfo={{
            title: 'Staking',
            tooltip: `Total staked ${tokenSymbol}`,
            value: '-',
          }}
          availableInfo={{
            title: 'Available',
            tooltip: `Available ${LIQUID_STAKING_TOKEN_PREFIX}${tokenSymbol}`,
            value: '98.00',
            valueTooltip: `Available ${LIQUID_STAKING_TOKEN_PREFIX}${tokenSymbol}`,
          }}
          unstakingInfo={{
            title: 'Unstaking',
            tooltip: `Total unstaking ${tokenSymbol} in progress`,
            value: '-',
          }}
          apyInfo={{
            title: 'APY',
            tooltip: 'APY (Annual Percentage Yield) %',
            value: '-',
          }}
          tokenSymbol={tokenSymbol}
        />

        {/* Validator Selection Component */}
        <ValidatorSelectionTable
          validators={validators}
          defaultSelectedValidators={[]}
          setSelectedValidators={setSelectedValidators}
          // isLoading={isLoading}
          isLoading={false}
        />
      </div>

      <LiquidStakingCard />
    </div>
  );
};

export default LiquidStakingTokenPage;
