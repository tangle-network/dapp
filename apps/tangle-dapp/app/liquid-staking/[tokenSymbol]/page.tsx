'use client';

import { notFound } from 'next/navigation';
import { FC } from 'react';

import LiquidStakeAndUnstakeCards from '../../../components/LiquidStaking/LiquidStakeAndUnstakeCards';
import UnstakeRequestsTable from '../../../components/LiquidStaking/UnstakeRequestsTable';
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
    <div className="flex flex-wrap gap-12 items-start">
      <LiquidStakeAndUnstakeCards />

      <UnstakeRequestsTable />
    </div>
  );
};

export default LiquidStakingTokenPage;
