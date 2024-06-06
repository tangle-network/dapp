import { Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import { GlassCard } from '../../components';
import LiquidStakingTokenItem from './LiquidStakingTokenItem';
import StatItem from './StatItem';
import {
  LiquidStakingChainToLogoMap,
  LiquidStakingChainToTokenMap,
} from '../../types/liquidStaking';
import entriesOf from '../../utils/entriesOf';

const LiquidStakingPage: FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <Typography variant="h4" fw="bold">
        Overview
      </Typography>

      <GlassCard className="flex flex-row items-center justify-between w-full">
        <div className="flex flex-col gap-2">
          <Typography variant="h5" fw="bold">
            Tangle Liquid Staking
          </Typography>

          <Typography variant="body1" fw="normal">
            Get Liquid Staking Tokens (LSTs) to earn & unleash restaking on
            Tangle via delegation.
          </Typography>
        </div>

        <div className="flex gap-6">
          <StatItem title="$123.01" subtitle="My Total Staking" />

          <StatItem title="$123,412.01" subtitle="TVS" />

          <StatItem title="3.12 %" subtitle="Est. Daily Rewards" />
        </div>
      </GlassCard>

      <GlassCard className="flex flex-col gap-4">
        <Typography variant="h5" fw="bold">
          Liquid Staking Tokens
        </Typography>

        {entriesOf(LiquidStakingChainToTokenMap).map(([chain, token]) => {
          return (
            <LiquidStakingTokenItem
              key={chain}
              logoPath={LiquidStakingChainToLogoMap[chain]}
              title={`Tangle ${chain}`}
              tokenSymbol={token}
            />
          );
        })}
      </GlassCard>
    </div>
  );
};

export default LiquidStakingPage;
