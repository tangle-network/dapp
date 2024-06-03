import { redirect } from 'next/navigation';
import { FC } from 'react';

import { LiquidStakingToken } from '../../../constants/liquidStaking';
import { PagePath } from '../../../types';
import TokenInfoCard from '../components/TokenInfoCard';
import LiquidStakingCard from './LiquidStakingCard';

type Props = {
  params: { tokenSymbol: string };
};

const LiquidStakingTokenPage: FC<Props> = ({ params: { tokenSymbol } }) => {
  const possibleTokens = Object.values(LiquidStakingToken).map((value) =>
    value.toString()
  );

  // Invalid token on the URL.
  if (!possibleTokens.includes(tokenSymbol)) {
    return redirect(PagePath.LIQUID_RESTAKING);
  }

  return (
    <div className="grid grid-cols-2 gap-12">
      <TokenInfoCard
        stakingInfo={{
          title: 'Staking',
          tooltip: 'Staking',
          value: '-',
        }}
        availableInfo={{
          title: 'Available',
          tooltip: 'Available',
          value: '-',
          valueTooltip: 'Available',
        }}
        unstakingInfo={{
          title: 'Unstaking',
          tooltip: 'Unstaking',
          value: '-',
        }}
        apyInfo={{
          title: 'APY',
          tooltip: 'APY',
          value: '-',
        }}
        tokenSymbol={tokenSymbol}
      />

      <LiquidStakingCard />
    </div>
  );
};

export default LiquidStakingTokenPage;
