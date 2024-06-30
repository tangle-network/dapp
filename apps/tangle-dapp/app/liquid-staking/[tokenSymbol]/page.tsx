import { notFound } from 'next/navigation';
import { FC } from 'react';

import LiquidStakeAndUnstakeCards from '../../../components/LiquidStaking/LiquidStakeAndUnstakeCards';
import TokenInfoCard from '../../../components/LiquidStaking/TokenInfoCard';
import {
  LIQUID_STAKING_TOKEN_PREFIX,
  LiquidStakingToken,
} from '../../../constants/liquidStaking';

type Props = {
  params: { tokenSymbol: string };
};

const LiquidStakingTokenPage: FC<Props> = ({ params: { tokenSymbol } }) => {
  const possibleTokens = Object.values(LiquidStakingToken).map((value) =>
    value.toString(),
  );

  // Invalid token provided on the URL parameters.
  if (!possibleTokens.includes(tokenSymbol)) {
    return notFound();
  }

  return (
    <div className="grid grid-cols-2 gap-12">
      <LiquidStakeAndUnstakeCards />

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
    </div>
  );
};

export default LiquidStakingTokenPage;
