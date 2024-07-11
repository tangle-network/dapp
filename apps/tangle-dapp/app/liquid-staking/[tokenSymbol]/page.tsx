'use client';

import { notFound } from 'next/navigation';
import { FC, useState } from 'react';

import LiquidStakingCard from '../../../components/LiquidStaking/LiquidStakingCard';
import { LiquidStakingSelectionTable } from '../../../components/LiquidStaking/LiquidStakingSelectionTable';
import TokenInfoCard from '../../../components/LiquidStaking/TokenInfoCard';
import { LIQUID_STAKING_TOKEN_PREFIX } from '../../../constants/liquidStaking';
import useLiquidStakingItems from '../../../data/liquidStaking/useLiquidStakingItems';
import isLiquidStakingToken from '../../../utils/liquidStaking/isLiquidStakingToken';

type Props = {
  params: { tokenSymbol: string };
};

const LiquidStakingTokenPage: FC<Props> = ({ params: { tokenSymbol } }) => {
  const { isLoading, data, dataType } = useLiquidStakingItems();

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  console.debug('Liquid Staking Items:', data, isLoading, dataType);
  console.debug('Selected Items:', selectedItems, setSelectedItems);

  // Invalid token provided on the URL parameters.
  if (!isLiquidStakingToken(tokenSymbol)) {
    return notFound();
  }

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
        <LiquidStakingSelectionTable
          data={data}
          dataType={dataType}
          setSelectedItems={setSelectedItems}
        />
      </div>

      <LiquidStakingCard />
    </div>
  );
};

export default LiquidStakingTokenPage;
