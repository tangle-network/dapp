import { notFound } from 'next/navigation';
import { FC } from 'react';

import AvailableWithdrawCard from '../../../components/LiquidStaking/AvailableWithdrawCard';
import LiquidStakeAndUnstakeCards from '../../../components/LiquidStaking/LiquidStakeAndUnstakeCards';
import StakedAssetsTable from '../../../components/LiquidStaking/StakedAssetsTable';
import isLiquidStakingToken from '../../../utils/liquidStaking/isLiquidStakingToken';

type Props = {
  params: { tokenSymbol: string };
};

const LiquidStakingTokenPage: FC<Props> = ({ params: { tokenSymbol } }) => {
  // Invalid token provided on the URL parameters.
  if (!isLiquidStakingToken(tokenSymbol)) {
    return notFound();
  }

  return (
    <div className="grid grid-cols-2 gap-12 items-start">
      <LiquidStakeAndUnstakeCards />

      <AvailableWithdrawCard />

      <StakedAssetsTable />
    </div>
  );
};

export default LiquidStakingTokenPage;
