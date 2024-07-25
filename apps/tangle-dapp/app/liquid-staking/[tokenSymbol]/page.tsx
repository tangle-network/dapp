import { notFound } from 'next/navigation';
import { FC } from 'react';

import LiquidStakeAndUnstakeCards from '../../../components/LiquidStaking/LiquidStakeAndUnstakeCards';
import { LiquidStakingSelectionTable } from '../../../components/LiquidStaking/LiquidStakingSelectionTable';
import UnstakeRequestsTable from '../../../components/LiquidStaking/unstakeRequestsTable/UnstakeRequestsTable';
import isLiquidStakingToken from '../../../utils/liquidStaking/isLiquidStakingToken';

type Props = {
  params: { tokenSymbol: string };
};

const LiquidStakingTokenPage: FC<Props> = ({ params: { tokenSymbol } }) => {
  if (!isLiquidStakingToken(tokenSymbol)) {
    return notFound();
  }

  return (
    <div className="grid grid-cols-2 gap-12">
      <LiquidStakeAndUnstakeCards />

      <div className="flex flex-col gap-4">
        <LiquidStakingSelectionTable />

        <UnstakeRequestsTable />
      </div>
    </div>
  );
};

export default LiquidStakingTokenPage;
