import { redirect } from 'next/navigation';
import { FC } from 'react';

import LiquidStakingCard from '../../../components/LiquidStaking/LiquidStakingCard';
import TokenInfoCard from '../../../components/LiquidStaking/TokenInfoCard';
import {
  LIQUID_STAKING_TOKEN_PREFIX,
  LiquidStakingToken,
} from '../../../constants/liquidStaking';
import { PagePath } from '../../../types';

type Props = {
  params: { tokenSymbol: string };
};

const LiquidStakingTokenPage: FC<Props> = ({ params: { tokenSymbol } }) => {
  const possibleTokens = Object.values(LiquidStakingToken).map((value) =>
    value.toString(),
  );

  // Invalid token on the URL.
  if (!possibleTokens.includes(tokenSymbol)) {
    return redirect(PagePath.LIQUID_STAKING);
  }

  return (
    <div className="grid grid-cols-2 gap-12">
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

      <LiquidStakingCard />
    </div>
  );
};

export default LiquidStakingTokenPage;
