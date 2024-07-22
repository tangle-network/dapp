'use client';

import { notFound } from 'next/navigation';
import { FC, useState } from 'react';

import LiquidStakeAndUnstakeCards from '../../../components/LiquidStaking/LiquidStakeAndUnstakeCards';
import { LiquidStakingSelectionTable } from '../../../components/LiquidStaking/LiquidStakingSelectionTable';
import UnstakeRequestsTable from '../../../components/LiquidStaking/UnstakeRequestsTable';
import { useLiquidStakingStore } from '../../../data/liquidStaking/store';
import useLiquidStakingItems from '../../../data/liquidStaking/useLiquidStakingItems';
import isLiquidStakingToken from '../../../utils/liquidStaking/isLiquidStakingToken';

type Props = {
  params: { tokenSymbol: string };
};

const LiquidStakingTokenPage: FC<Props> = ({ params: { tokenSymbol } }) => {
  const { selectedChainId } = useLiquidStakingStore();
  const { isLoading, data, dataType } = useLiquidStakingItems(selectedChainId);

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  console.debug('Selected Items:', selectedItems);

  // TODO: This value should come from the store. This is a temporary check.
  const [showStakeOperationTable, setShowStakeOperationTable] = useState(true);

  if (!isLiquidStakingToken(tokenSymbol)) {
    return notFound();
  }

  return (
    <div className="grid grid-cols-2 gap-12">
      <LiquidStakeAndUnstakeCards />

      {/* TODO: Remove this */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => setShowStakeOperationTable(!showStakeOperationTable)}
        >
          Toggle Stake/Unstake
        </button>

        {showStakeOperationTable ? (
          <LiquidStakingSelectionTable
            data={data}
            dataType={dataType}
            setSelectedItems={setSelectedItems}
            isLoading={isLoading}
          />
        ) : (
          <UnstakeRequestsTable />
        )}
      </div>
    </div>
  );
};

export default LiquidStakingTokenPage;
