'use client';

import { notFound } from 'next/navigation';
import { FC, useState } from 'react';

import LiquidStakingCard from '../../../components/LiquidStaking/LiquidStakingCard';
import { LiquidStakingSelectionTable } from '../../../components/LiquidStaking/LiquidStakingSelectionTable';
import { useLiquidStakingStore } from '../../../data/liquidStaking/store';
import useLiquidStakingItems from '../../../data/liquidStaking/useLiquidStakingItems';
import isLiquidStakingToken from '../../../utils/liquidStaking/isLiquidStakingToken';

type Props = {
  params: { tokenSymbol: string };
};

const LiquidStakingTokenPage: FC<Props> = ({ params: { tokenSymbol } }) => {
  const { selectedChain } = useLiquidStakingStore();
  const { isLoading, data, dataType } = useLiquidStakingItems(selectedChain);

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  console.debug('Selected Items:', selectedItems);

  if (!isLiquidStakingToken(tokenSymbol)) {
    return notFound();
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
      <LiquidStakingCard />

      <LiquidStakingSelectionTable
        data={data}
        dataType={dataType}
        setSelectedItems={setSelectedItems}
        isLoading={isLoading}
      />
    </div>
  );
};

export default LiquidStakingTokenPage;
